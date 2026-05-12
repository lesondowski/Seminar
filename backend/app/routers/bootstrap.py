from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_authorization_token
from app.responses import fail
from app.security import decode_access_token

router = APIRouter(prefix="/api/v1", tags=["bootstrap"])


def _get_visitor_session(db: Session, token: str | None):
    if not token:
        return None
    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    session_uuid = payload.get("sub")
    scope = payload.get("scope")
    if not session_uuid or scope != "visitor":
        return None

    query = text(
        """
        SELECT *
        FROM sessions
        WHERE session_uuid = :session_uuid
          AND session_scope = 'visitor'
          AND session_state = 'active'
        LIMIT 1
        """
    )
    return db.execute(query, {"session_uuid": session_uuid}).mappings().first()


def _to_poi_payload(rows, site_id: int):
    return [
        {
            "id": int(row["id"]),
            "site_id": site_id,
            "lat": float(row["lat"]),
            "lng": float(row["lng"]),
            "trigger_radius": row["trigger_radius"],
            "image": row["image_url"],
            "heroImage": row["image_url"],
            "openingHours": "08:00 - 18:00",
            "ticketLabel": "Miễn phí",
            "tags": ["Điểm tham quan"],
            "audio_url": None,
        }
        for row in rows
    ]


def _to_tours_payload(rows):
    tours_payload = []
    for row in rows:
        poi_ids = [int(x) for x in (row["poi_ids_csv"] or "").split(",") if x]
        tours_payload.append({"id": int(row["id"]), "name": row["name"], "poi_ids": poi_ids})
    return tours_payload


def _load_published_dataset(db: Session, site_id: int, snapshot_id: int | None):
    if not snapshot_id:
        return None

    snapshot = db.execute(
        text(
            """
            SELECT id, bootstrap_version, published_at
            FROM publish_snapshots
            WHERE id = :snapshot_id AND site_id = :site_id
            LIMIT 1
            """
        ),
        {"snapshot_id": snapshot_id, "site_id": site_id},
    ).mappings().first()

    if not snapshot:
        return None

    pois = db.execute(
        text(
            """
            SELECT source_poi_id AS id, lat, lng, trigger_radius, image_url
            FROM published_pois
            WHERE publish_snapshot_id = :snapshot_id
            ORDER BY id
            """
        ),
        {"snapshot_id": snapshot_id},
    ).mappings().all()

    if not pois:
        return None

    translations = db.execute(
        text(
            """
            SELECT pp.source_poi_id AS poi_id, t.language_code AS language,
                   t.name, t.description, t.audio_url
            FROM published_poi_translations t
            JOIN published_pois pp ON pp.id = t.published_poi_id
            WHERE pp.publish_snapshot_id = :snapshot_id
            ORDER BY t.id
            """
        ),
        {"snapshot_id": snapshot_id},
    ).mappings().all()

    tours = db.execute(
        text(
            """
            SELECT pt.source_tour_id AS id, pt.name,
                   GROUP_CONCAT(pp.source_poi_id ORDER BY tp.sequence_no SEPARATOR ',') AS poi_ids_csv
            FROM published_tours pt
            LEFT JOIN published_tour_pois tp ON tp.published_tour_id = pt.id
            LEFT JOIN published_pois pp ON pp.id = tp.published_poi_id
            WHERE pt.publish_snapshot_id = :snapshot_id
            GROUP BY pt.id, pt.source_tour_id, pt.name
            ORDER BY pt.id
            """
        ),
        {"snapshot_id": snapshot_id},
    ).mappings().all()

    languages = db.execute(
        text(
            """
            SELECT language_code
            FROM publish_snapshot_languages
            WHERE publish_snapshot_id = :snapshot_id
            ORDER BY sort_order
            """
        ),
        {"snapshot_id": snapshot_id},
    ).scalars().all()

    return {
        "bootstrap_version": snapshot["bootstrap_version"],
        "published_at": snapshot["published_at"],
        "pois": _to_poi_payload(pois, site_id),
        "translations": [dict(row) for row in translations],
        "tours": _to_tours_payload(tours),
        "languages": languages,
    }


def _load_live_dataset(db: Session, site_id: int):
    pois = db.execute(
        text(
            """
            SELECT id, lat, lng, trigger_radius, image_url
            FROM pois
            WHERE site_id = :site_id
              AND is_active = 1
            ORDER BY id
            """
        ),
        {"site_id": site_id},
    ).mappings().all()

    translations = db.execute(
        text(
            """
            SELECT pt.poi_id, pt.language_code AS language,
                   pt.name, pt.description, pt.audio_url
            FROM poi_translations pt
            JOIN pois p ON p.id = pt.poi_id
            WHERE p.site_id = :site_id
              AND p.is_active = 1
            ORDER BY pt.id
            """
        ),
        {"site_id": site_id},
    ).mappings().all()

    tours = db.execute(
        text(
            """
            SELECT t.id, t.name,
                   GROUP_CONCAT(tp.poi_id ORDER BY tp.sequence_no SEPARATOR ',') AS poi_ids_csv
            FROM tours t
            LEFT JOIN tour_pois tp ON tp.tour_id = t.id
            LEFT JOIN pois p ON p.id = tp.poi_id AND p.is_active = 1
            WHERE t.site_id = :site_id
              AND t.is_active = 1
            GROUP BY t.id, t.name
            ORDER BY t.id
            """
        ),
        {"site_id": site_id},
    ).mappings().all()

    languages = db.execute(
        text(
            """
            SELECT language_code
            FROM site_supported_languages
            WHERE site_id = :site_id
            ORDER BY sort_order
            """
        ),
        {"site_id": site_id},
    ).scalars().all()

    return {
        "bootstrap_version": f"live-site-{site_id}",
        "published_at": datetime.utcnow(),
        "pois": _to_poi_payload(pois, site_id),
        "translations": [dict(row) for row in translations],
        "tours": _to_tours_payload(tours),
        "languages": languages,
    }


@router.get("/bootstrap")
def get_bootstrap(db: Session = Depends(get_db), token: str | None = Depends(get_authorization_token)):
    session = _get_visitor_session(db, token)
    if not session:
        return fail("UNAUTHORIZED", "Unauthorized", 401)

    site_row = db.execute(
        text(
            """
            SELECT s.id, s.site_code, s.name, s.current_publish_snapshot_id,
                   c.default_language, c.trigger_radius_m, c.exit_radius_m,
                   c.debounce_seconds, c.replay_distance_m, c.chatbot_timeout_ms,
                   c.chatbot_retry_count, c.gps_poll_interval_seconds
            FROM sites s
            LEFT JOIN site_app_configs c ON c.site_id = s.id
            WHERE s.id = :site_id
            LIMIT 1
            """
        ),
        {"site_id": session["site_id"]},
    ).mappings().first()

    if not site_row:
        return fail("RESOURCE_NOT_FOUND", "Site not found", 404)

    # Prioritize live DB tables so visitor always sees the latest POI data.
    dataset = _load_live_dataset(db, site_row["id"])
    if not dataset["pois"]:
        dataset = _load_published_dataset(db, site_row["id"], site_row["current_publish_snapshot_id"]) or dataset

    payload = {
        "site": {"id": site_row["id"], "site_code": site_row["site_code"], "name": site_row["name"]},
        "pois": dataset["pois"],
        "translations": dataset["translations"],
        "tours": dataset["tours"],
        "app_config": {
            "default_language": site_row["default_language"] or "vi",
            "supported_languages": dataset["languages"] or [site_row["default_language"] or "vi"],
            "trigger_radius_m": site_row["trigger_radius_m"] or 5,
            "exit_radius_m": site_row["exit_radius_m"] or 7,
            "debounce_seconds": site_row["debounce_seconds"] or 2,
            "replay_distance_m": site_row["replay_distance_m"] or 100,
            "chatbot_timeout_ms": site_row["chatbot_timeout_ms"] or 3000,
            "chatbot_retry_count": site_row["chatbot_retry_count"] or 1,
            "gps_poll_interval_seconds": site_row["gps_poll_interval_seconds"] or 2,
        },
        "bootstrap_version": dataset["bootstrap_version"],
        "published_at": dataset["published_at"].isoformat() if dataset["published_at"] else None,
    }

    db.execute(
        text(
            """
            UPDATE sessions
            SET bootstrap_version = :bootstrap_version,
                last_activity_at = UTC_TIMESTAMP(),
                updated_at = UTC_TIMESTAMP()
            WHERE id = :session_id
            """
        ),
        {"bootstrap_version": dataset["bootstrap_version"], "session_id": session["id"]},
    )
    db.commit()

    return payload
