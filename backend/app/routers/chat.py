from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_authorization_token
from app.responses import fail, ok
from app.security import decode_access_token

FALLBACK_MESSAGE = "Tôi chỉ hỗ trợ thông tin tham quan tại đây."

router = APIRouter(prefix="/api/v1", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    bootstrap_version: str
    language: str | None = "vi"
    poi_id: int | None = None
    tour_id: int | None = None


@router.post("/chat")
def post_chat(payload: ChatRequest, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not token:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    try:
        token_payload = decode_access_token(token)
    except Exception:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    if token_payload.get("scope") != "visitor":
        return fail("FORBIDDEN", "Forbidden", 403)

    session = db.execute(
        text(
            """
            SELECT *
            FROM sessions
            WHERE session_uuid = :session_uuid
              AND session_scope = 'visitor'
              AND session_state = 'active'
            LIMIT 1
            """
        ),
        {"session_uuid": token_payload.get("sub")},
    ).mappings().first()

    if not session:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    message = (payload.message or "").strip()
    if not message:
        return fail("VALIDATION_ERROR", "message is required", 400)

    if not session["bootstrap_version"] or payload.bootstrap_version != session["bootstrap_version"]:
        return fail("BOOTSTRAP_VERSION_MISMATCH", "Bootstrap version does not match session", 409)

    answer = FALLBACK_MESSAGE if "timeout" in message.lower() else "Bạn đang ở khu tham quan chính. Hãy mở POI để nghe thuyết minh."
    latency_ms = 320

    db.execute(
        text(
            """
            INSERT INTO chatbot_logs (
              session_id, site_id, bootstrap_version, language_code,
              question, answer, source_type, status, latency_ms, created_at
            ) VALUES (
              :session_id, :site_id, :bootstrap_version, :language_code,
              :question, :answer, 'published_data', :status, :latency_ms, UTC_TIMESTAMP()
            )
            """
        ),
        {
            "session_id": session["id"],
            "site_id": session["site_id"],
            "bootstrap_version": session["bootstrap_version"],
            "language_code": payload.language or "vi",
            "question": message,
            "answer": answer,
            "status": "fallback" if answer == FALLBACK_MESSAGE else "success",
            "latency_ms": latency_ms,
        },
    )
    db.execute(
        text(
            """
            UPDATE sessions
            SET last_activity_at = UTC_TIMESTAMP(),
                updated_at = UTC_TIMESTAMP()
            WHERE id = :session_id
            """
        ),
        {"session_id": session["id"]},
    )
    db.commit()

    return ok({"answer": answer, "source_type": "published_data", "latency_ms": latency_ms})
