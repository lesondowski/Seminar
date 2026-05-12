from datetime import timedelta

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_authorization_token
from app.responses import fail, ok
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    hash_token,
    utcnow,
)

router = APIRouter(prefix="/api/v1/auth", tags=["visitor-auth"])


class ScanQrRequest(BaseModel):
    qr_code: str


class PaymentMockRequest(BaseModel):
    session_id: str


class HeartbeatRequest(BaseModel):
    session_uuid: str


def _extract_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


@router.post("/scan-qr")
def scan_qr(payload: ScanQrRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    qr_code = (payload.qr_code or "").strip()
    if not qr_code:
        return fail("QR_INVALID", "QR code is invalid", 400)

    qr = db.execute(
        text("SELECT * FROM qr_access_codes WHERE qr_code = :qr_code LIMIT 1"),
        {"qr_code": qr_code},
    ).mappings().first()

    # Frontend currently uses this default QR code for auto-entry on home route.
    if not qr and qr_code == "SITE-ENTRY-ABC123":
        qr = db.execute(
            text(
                """
                SELECT *
                FROM qr_access_codes
                WHERE access_mode = 'free'
                  AND is_active = 1
                ORDER BY id
                LIMIT 1
                """
            )
        ).mappings().first()

    if not qr:
        return fail("QR_NOT_FOUND", "QR code not found", 404)

    if not qr["is_active"]:
        return fail("QR_INVALID", "QR code is invalid", 400)

    if qr["expires_at"] is not None and qr["expires_at"] < utcnow().replace(tzinfo=None):
        return fail("QR_EXPIRED", "QR code has expired", 410)

    result = "accepted"
    db.execute(
        text(
            """
            INSERT INTO qr_access_events (qr_access_code_id, site_id, client_ip, user_agent, result, created_at)
            VALUES (:qr_access_code_id, :site_id, :client_ip, :user_agent, :result, UTC_TIMESTAMP())
            """
        ),
        {
            "qr_access_code_id": qr["id"],
            "site_id": qr["site_id"],
            "client_ip": _extract_ip(request),
            "user_agent": request.headers.get("user-agent", "unknown")[:512],
            "result": result,
        },
    )
    qr_event_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()

    requires_payment = 1 if qr["access_mode"] == "paid" else 0
    session_state = "created" if requires_payment else "active"

    db.execute(
        text(
            """
            INSERT INTO sessions (
              session_uuid, session_scope, session_state, site_id,
              qr_access_event_id, qr_access_code_id, requires_payment,
              access_token_expires_at, refresh_token_expires_at,
              last_activity_at, created_at, updated_at
            ) VALUES (
              UUID(), 'visitor', :session_state, :site_id,
              :qr_access_event_id, :qr_access_code_id, :requires_payment,
              DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY),
              UTC_TIMESTAMP(), UTC_TIMESTAMP(), UTC_TIMESTAMP()
            )
            """
        ),
        {
            "session_state": session_state,
            "site_id": qr["site_id"],
            "qr_access_event_id": qr_event_id,
            "qr_access_code_id": qr["id"],
            "requires_payment": requires_payment,
        },
    )
    session = db.execute(text("SELECT * FROM sessions WHERE id = LAST_INSERT_ID() LIMIT 1")).mappings().first()

    access_token = create_access_token(session["session_uuid"], "visitor", ttl_minutes=30)
    refresh_token = create_refresh_token(session["session_uuid"], "visitor", ttl_days=7)

    db.execute(
        text("UPDATE sessions SET refresh_token_hash = :hash WHERE id = :id"),
        {"hash": hash_token(refresh_token), "id": session["id"]},
    )
    db.commit()

    response.set_cookie("visitor_refresh_token", refresh_token, httponly=True, samesite="lax")

    return ok(
        {
            "access_token": access_token,
            "token_type": "bearer",
            "session_id": session["session_uuid"],
            "site_id": session["site_id"],
            "requires_payment": bool(requires_payment),
            "session_state": session_state,
            "access_token_expires_in_seconds": 1800,
        }
    )


@router.post("/payment/mock")
def payment_mock(payload: PaymentMockRequest, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not token:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    try:
        token_payload = decode_access_token(token)
    except Exception:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    session = db.execute(
        text(
            """
            SELECT * FROM sessions
            WHERE session_uuid = :session_uuid
              AND session_scope = 'visitor'
            LIMIT 1
            """
        ),
        {"session_uuid": token_payload.get("sub")},
    ).mappings().first()

    if not session:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    if session["session_uuid"] != payload.session_id:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    db.execute(
        text(
            """
            UPDATE sessions
            SET session_state = 'active',
                last_activity_at = UTC_TIMESTAMP(),
                updated_at = UTC_TIMESTAMP()
            WHERE id = :id
            """
        ),
        {"id": session["id"]},
    )
    db.execute(
        text(
            """
            INSERT INTO payment_logs (session_id, site_id, amount, currency, status, idempotency_key, created_at, updated_at)
            VALUES (:session_id, :site_id, 0.00, 'VND', 'paid', :idempotency_key, UTC_TIMESTAMP(), UTC_TIMESTAMP())
            ON DUPLICATE KEY UPDATE status = 'paid', updated_at = UTC_TIMESTAMP()
            """
        ),
        {
            "session_id": session["id"],
            "site_id": session["site_id"],
            "idempotency_key": f"session-{session['id']}-payment",
        },
    )
    db.commit()

    return ok({"session_id": session["session_uuid"], "payment_status": "paid", "session_state": "active"})


@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_cookie = request.cookies.get("visitor_refresh_token")
    if not refresh_cookie:
        return fail("SESSION_EXPIRED", "Session expired", 401)

    try:
        payload = decode_refresh_token(refresh_cookie)
    except Exception:
        return fail("SESSION_EXPIRED", "Session expired", 401)

    if payload.get("scope") != "visitor":
        return fail("SESSION_EXPIRED", "Session expired", 401)

    session = db.execute(
        text(
            """
            SELECT * FROM sessions
            WHERE session_uuid = :session_uuid
              AND session_scope = 'visitor'
              AND session_state = 'active'
            LIMIT 1
            """
        ),
        {"session_uuid": payload.get("sub")},
    ).mappings().first()

    if not session:
        return fail("SESSION_EXPIRED", "Session expired", 401)

    if session["refresh_token_hash"] != hash_token(refresh_cookie):
        return fail("SESSION_EXPIRED", "Session expired", 401)

    access_token = create_access_token(session["session_uuid"], "visitor", ttl_minutes=30)
    new_refresh = create_refresh_token(session["session_uuid"], "visitor", ttl_days=7)

    db.execute(
        text(
            """
            UPDATE sessions
            SET refresh_token_hash = :refresh_hash,
                access_token_expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE),
                refresh_token_expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY),
                last_activity_at = UTC_TIMESTAMP(),
                updated_at = UTC_TIMESTAMP()
            WHERE id = :id
            """
        ),
        {"refresh_hash": hash_token(new_refresh), "id": session["id"]},
    )
    db.commit()

    response.set_cookie("visitor_refresh_token", new_refresh, httponly=True, samesite="lax")
    return ok(
        {
            "access_token": access_token,
            "token_type": "bearer",
            "session_id": session["session_uuid"],
            "session_state": "active",
            "access_token_expires_in_seconds": 1800,
        }
    )


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    session_uuid = None

    if token:
        try:
            payload = decode_access_token(token)
            if payload.get("scope") == "visitor":
                session_uuid = payload.get("sub")
        except Exception:
            session_uuid = None

    if not session_uuid:
        refresh_cookie = request.cookies.get("visitor_refresh_token")
        if refresh_cookie:
            try:
                payload = decode_refresh_token(refresh_cookie)
                if payload.get("scope") == "visitor":
                    session_uuid = payload.get("sub")
            except Exception:
                session_uuid = None

    if session_uuid:
        db.execute(
            text(
                """
                UPDATE sessions
                SET session_state = 'revoked', revoked_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
                WHERE session_uuid = :session_uuid
                  AND session_scope = 'visitor'
                """
            ),
            {"session_uuid": session_uuid},
        )
        db.commit()

    response.delete_cookie("visitor_refresh_token")
    return ok({"message": "Logged out"})


@router.post("/heartbeat")
def heartbeat(payload: HeartbeatRequest, db: Session = Depends(get_db)):
    result = db.execute(
        text(
            """
            UPDATE sessions
            SET last_activity_at = UTC_TIMESTAMP(),
                updated_at = UTC_TIMESTAMP()
            WHERE session_uuid = :session_uuid
              AND session_scope = 'visitor'
              AND session_state = 'active'
            """
        ),
        {"session_uuid": payload.session_uuid},
    )
    db.commit()

    if result.rowcount == 0:
        return fail("RESOURCE_NOT_FOUND", "Active visitor session not found", 404)

    return ok({"updated": True})
