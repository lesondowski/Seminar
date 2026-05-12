from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_authorization_token
from app.responses import fail, ok
from app.security import create_access_token, create_refresh_token, decode_access_token, hash_token

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class PoiPayload(BaseModel):
    id: int | None = None
    lat: float
    lng: float
    trigger_radius: int = 5
    translations: list[dict] = []


class TourPayload(BaseModel):
    id: int | None = None
    name: str
    poi_ids: list[int] = []


def _auth_admin(db: Session, token: str | None):
    if not token:
        return None
    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    if payload.get("scope") != "admin":
        return None

    session = db.execute(
        text(
            """
            SELECT *
            FROM sessions
            WHERE session_uuid = :session_uuid
              AND session_scope = 'admin'
              AND session_state = 'active'
            LIMIT 1
            """
        ),
        {"session_uuid": payload.get("sub")},
    ).mappings().first()
    return session


@router.post("/login")
def admin_login(payload: AdminLoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.execute(
        text("SELECT id, username FROM users WHERE username = :username AND is_active = 1 LIMIT 1"),
        {"username": payload.username.strip()},
    ).mappings().first()

    # Local MVP login: allow admin/admin for quick integration.
    if not user or not (payload.username == "admin" and payload.password == "admin"):
        return fail("INVALID_CREDENTIALS", "Sai ten dang nhap hoac mat khau", 401)

    db.execute(
        text(
            """
            INSERT INTO sessions (
              session_uuid, session_scope, session_state, user_id,
              requires_payment, access_token_expires_at, refresh_token_expires_at,
              last_activity_at, created_at, updated_at
            ) VALUES (
              UUID(), 'admin', 'active', :user_id,
              0, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 120 MINUTE), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY),
              UTC_TIMESTAMP(), UTC_TIMESTAMP(), UTC_TIMESTAMP()
            )
            """
        ),
        {"user_id": user["id"]},
    )
    session = db.execute(text("SELECT * FROM sessions WHERE id = LAST_INSERT_ID() LIMIT 1")).mappings().first()

    access_token = create_access_token(session["session_uuid"], "admin", ttl_minutes=120)
    refresh_token = create_refresh_token(session["session_uuid"], "admin", ttl_days=7)

    db.execute(
        text("UPDATE sessions SET refresh_token_hash = :hash WHERE id = :id"),
        {"hash": hash_token(refresh_token), "id": session["id"]},
    )
    db.commit()

    response.set_cookie("admin_refresh_token", refresh_token, httponly=True, samesite="lax")
    return ok({"access_token": access_token, "username": user["username"]})


@router.post("/logout")
def admin_logout(request: Request, response: Response, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    session = _auth_admin(db, token)
    if session:
        db.execute(
            text(
                """
                UPDATE sessions
                SET session_state = 'revoked', revoked_at = UTC_TIMESTAMP(), updated_at = UTC_TIMESTAMP()
                WHERE id = :id
                """
            ),
            {"id": session["id"]},
        )
        db.commit()

    response.delete_cookie("admin_refresh_token")
    return ok({"message": "Logged out"})


def _load_pois(db: Session, site_id: int):
    pois = db.execute(
        text("SELECT id, site_id, lat, lng, trigger_radius, image_url FROM pois WHERE site_id = :site_id ORDER BY id DESC"),
        {"site_id": site_id},
    ).mappings().all()

    translations = db.execute(
        text("SELECT poi_id, language_code AS language, name, description, audio_url FROM poi_translations WHERE poi_id IN (SELECT id FROM pois WHERE site_id = :site_id)"),
        {"site_id": site_id},
    ).mappings().all()

    by_poi = {}
    for tr in translations:
        by_poi.setdefault(tr["poi_id"], []).append(dict(tr))

    return [
        {
            "id": p["id"],
            "site_id": p["site_id"],
            "lat": float(p["lat"]),
            "lng": float(p["lng"]),
            "trigger_radius": p["trigger_radius"],
            "image_url": p["image_url"],
            "translations": by_poi.get(p["id"], []),
        }
        for p in pois
    ]


@router.get("/pois")
def get_admin_pois(db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    site_id = db.execute(text("SELECT id FROM sites ORDER BY id LIMIT 1")).scalar()
    return ok({"pois": _load_pois(db, site_id)})


@router.post("/pois")
def create_admin_poi(payload: PoiPayload, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    site_id = db.execute(text("SELECT id FROM sites ORDER BY id LIMIT 1")).scalar()
    db.execute(
        text(
            """
            INSERT INTO pois (site_id, lat, lng, trigger_radius, image_url, is_active, created_at, updated_at)
            VALUES (:site_id, :lat, :lng, :trigger_radius, NULL, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())
            """
        ),
        {
            "site_id": site_id,
            "lat": payload.lat,
            "lng": payload.lng,
            "trigger_radius": payload.trigger_radius,
        },
    )
    poi_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()

    for tr in payload.translations:
        if not (tr.get("name") or tr.get("description") or tr.get("audio_url")):
            continue
        db.execute(
            text(
                """
                INSERT INTO poi_translations (poi_id, language_code, name, description, audio_url, created_at, updated_at)
                VALUES (:poi_id, :language_code, :name, :description, :audio_url, UTC_TIMESTAMP(), UTC_TIMESTAMP())
                """
            ),
            {
                "poi_id": poi_id,
                "language_code": tr.get("language", "vi"),
                "name": tr.get("name", ""),
                "description": tr.get("description", ""),
                "audio_url": tr.get("audio_url") or None,
            },
        )

    db.commit()
    poi = [p for p in _load_pois(db, site_id) if p["id"] == poi_id][0]
    return ok({"poi": poi}, status_code=201)


@router.put("/pois/{poi_id}")
def update_admin_poi(poi_id: int, payload: PoiPayload, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    exists = db.execute(text("SELECT id FROM pois WHERE id = :id LIMIT 1"), {"id": poi_id}).scalar()
    if not exists:
        return fail("POI_NOT_FOUND", "POI not found", 404)

    db.execute(
        text(
            """
            UPDATE pois
            SET lat = :lat,
                lng = :lng,
                trigger_radius = :trigger_radius,
                updated_at = UTC_TIMESTAMP()
            WHERE id = :id
            """
        ),
        {"id": poi_id, "lat": payload.lat, "lng": payload.lng, "trigger_radius": payload.trigger_radius},
    )

    db.execute(text("DELETE FROM poi_translations WHERE poi_id = :poi_id"), {"poi_id": poi_id})
    for tr in payload.translations:
        if not (tr.get("name") or tr.get("description") or tr.get("audio_url")):
            continue
        db.execute(
            text(
                """
                INSERT INTO poi_translations (poi_id, language_code, name, description, audio_url, created_at, updated_at)
                VALUES (:poi_id, :language_code, :name, :description, :audio_url, UTC_TIMESTAMP(), UTC_TIMESTAMP())
                """
            ),
            {
                "poi_id": poi_id,
                "language_code": tr.get("language", "vi"),
                "name": tr.get("name", ""),
                "description": tr.get("description", ""),
                "audio_url": tr.get("audio_url") or None,
            },
        )

    db.commit()
    site_id = db.execute(text("SELECT site_id FROM pois WHERE id = :id"), {"id": poi_id}).scalar_one()
    poi = [p for p in _load_pois(db, site_id) if p["id"] == poi_id][0]
    return ok({"poi": poi})


@router.delete("/pois/{poi_id}")
def delete_admin_poi(poi_id: int, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    db.execute(text("DELETE FROM tour_pois WHERE poi_id = :poi_id"), {"poi_id": poi_id})
    db.execute(text("DELETE FROM poi_translations WHERE poi_id = :poi_id"), {"poi_id": poi_id})
    db.execute(text("DELETE FROM pois WHERE id = :poi_id"), {"poi_id": poi_id})
    db.commit()
    return ok({"deleted": True})


@router.get("/tours")
def get_admin_tours(db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    site_id = db.execute(text("SELECT id FROM sites ORDER BY id LIMIT 1")).scalar_one()
    tours = db.execute(
        text(
            """
            SELECT t.id, t.name,
                   GROUP_CONCAT(tp.poi_id ORDER BY tp.sequence_no SEPARATOR ',') AS poi_ids_csv
            FROM tours t
            LEFT JOIN tour_pois tp ON tp.tour_id = t.id
            WHERE t.site_id = :site_id
            GROUP BY t.id, t.name
            ORDER BY t.id DESC
            """
        ),
        {"site_id": site_id},
    ).mappings().all()

    tours_payload = [{"id": t["id"], "name": t["name"], "poi_ids": [int(x) for x in (t["poi_ids_csv"] or "").split(",") if x]} for t in tours]
    return ok({"tours": tours_payload, "pois": _load_pois(db, site_id)})


@router.post("/tours")
def create_admin_tour(payload: TourPayload, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    site_id = db.execute(text("SELECT id FROM sites ORDER BY id LIMIT 1")).scalar_one()
    db.execute(
        text(
            """
            INSERT INTO tours (site_id, name, description, is_active, created_at, updated_at)
            VALUES (:site_id, :name, NULL, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())
            """
        ),
        {"site_id": site_id, "name": payload.name.strip()},
    )
    tour_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()

    for idx, poi_id in enumerate(payload.poi_ids, start=1):
        db.execute(
            text(
                """
                INSERT INTO tour_pois (tour_id, poi_id, sequence_no, created_at, updated_at)
                VALUES (:tour_id, :poi_id, :sequence_no, UTC_TIMESTAMP(), UTC_TIMESTAMP())
                """
            ),
            {"tour_id": tour_id, "poi_id": poi_id, "sequence_no": idx},
        )

    db.commit()
    return ok({"tour": {"id": tour_id, "name": payload.name.strip(), "poi_ids": payload.poi_ids}}, status_code=201)


@router.put("/tours/{tour_id}")
def update_admin_tour(tour_id: int, payload: TourPayload, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    exists = db.execute(text("SELECT id FROM tours WHERE id = :id LIMIT 1"), {"id": tour_id}).scalar()
    if not exists:
        return fail("TOUR_NOT_FOUND", "Tour not found", 404)

    db.execute(text("UPDATE tours SET name = :name, updated_at = UTC_TIMESTAMP() WHERE id = :id"), {"name": payload.name.strip(), "id": tour_id})
    db.execute(text("DELETE FROM tour_pois WHERE tour_id = :tour_id"), {"tour_id": tour_id})

    for idx, poi_id in enumerate(payload.poi_ids, start=1):
        db.execute(
            text(
                """
                INSERT INTO tour_pois (tour_id, poi_id, sequence_no, created_at, updated_at)
                VALUES (:tour_id, :poi_id, :sequence_no, UTC_TIMESTAMP(), UTC_TIMESTAMP())
                """
            ),
            {"tour_id": tour_id, "poi_id": poi_id, "sequence_no": idx},
        )

    db.commit()
    return ok({"tour": {"id": tour_id, "name": payload.name.strip(), "poi_ids": payload.poi_ids}})


@router.delete("/tours/{tour_id}")
def delete_admin_tour(tour_id: int, db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    if not _auth_admin(db, token):
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    db.execute(text("DELETE FROM tour_pois WHERE tour_id = :tour_id"), {"tour_id": tour_id})
    db.execute(text("DELETE FROM tours WHERE id = :tour_id"), {"tour_id": tour_id})
    db.commit()
    return ok({"deleted": True})


@router.post("/publish")
def admin_publish(db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    session = _auth_admin(db, token)
    if not session:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    site_id = db.execute(text("SELECT id FROM sites ORDER BY id LIMIT 1")).scalar_one()
    bootstrap_version = db.execute(text("SELECT CONCAT('site-', :site_id, '-published-', DATE_FORMAT(UTC_TIMESTAMP(), '%Y%m%dT%H%i%sZ'))"), {"site_id": site_id}).scalar_one()

    db.execute(
        text(
            """
            INSERT INTO publish_snapshots (site_id, bootstrap_version, published_by_user_id, published_at, created_at, updated_at)
            VALUES (:site_id, :bootstrap_version, :user_id, UTC_TIMESTAMP(), UTC_TIMESTAMP(), UTC_TIMESTAMP())
            """
        ),
        {"site_id": site_id, "bootstrap_version": bootstrap_version, "user_id": session["user_id"]},
    )
    snapshot_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()

    db.execute(
        text(
            """
            INSERT INTO publish_snapshot_languages (publish_snapshot_id, language_code, sort_order, created_at)
            SELECT :snapshot_id, language_code, sort_order, UTC_TIMESTAMP()
            FROM site_supported_languages
            WHERE site_id = :site_id
            """
        ),
        {"snapshot_id": snapshot_id, "site_id": site_id},
    )

    db.execute(
        text(
            """
            INSERT INTO published_pois (publish_snapshot_id, source_poi_id, lat, lng, trigger_radius, image_url, created_at, updated_at)
            SELECT :snapshot_id, id, lat, lng, trigger_radius, image_url, UTC_TIMESTAMP(), UTC_TIMESTAMP()
            FROM pois
            WHERE site_id = :site_id
            """
        ),
        {"snapshot_id": snapshot_id, "site_id": site_id},
    )

    db.execute(
        text(
            """
            INSERT INTO published_poi_translations (published_poi_id, language_code, name, description, audio_url, created_at, updated_at)
            SELECT pp.id, pt.language_code, pt.name, pt.description, pt.audio_url, UTC_TIMESTAMP(), UTC_TIMESTAMP()
            FROM published_pois pp
            JOIN poi_translations pt ON pt.poi_id = pp.source_poi_id
            WHERE pp.publish_snapshot_id = :snapshot_id
            """
        ),
        {"snapshot_id": snapshot_id},
    )

    db.execute(
        text(
            """
            INSERT INTO published_tours (publish_snapshot_id, source_tour_id, name, description, created_at, updated_at)
            SELECT :snapshot_id, t.id, t.name, t.description, UTC_TIMESTAMP(), UTC_TIMESTAMP()
            FROM tours t
            WHERE t.site_id = :site_id
            """
        ),
        {"snapshot_id": snapshot_id, "site_id": site_id},
    )

    db.execute(
        text(
            """
            INSERT INTO published_tour_pois (published_tour_id, published_poi_id, sequence_no, created_at, updated_at)
            SELECT pt.id, pp.id, tp.sequence_no, UTC_TIMESTAMP(), UTC_TIMESTAMP()
            FROM published_tours pt
            JOIN tour_pois tp ON tp.tour_id = pt.source_tour_id
            JOIN published_pois pp
              ON pp.publish_snapshot_id = pt.publish_snapshot_id
             AND pp.source_poi_id = tp.poi_id
            WHERE pt.publish_snapshot_id = :snapshot_id
            """
        ),
        {"snapshot_id": snapshot_id},
    )

    db.execute(text("UPDATE sites SET current_publish_snapshot_id = :snapshot_id WHERE id = :site_id"), {"snapshot_id": snapshot_id, "site_id": site_id})
    db.commit()

    return ok({"bootstrap_version": bootstrap_version})
