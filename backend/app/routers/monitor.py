from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas.monitor import OnlineBySite, OnlineDevicesResponse

router = APIRouter(prefix="/api/v1/monitor", tags=["monitor"])


@router.get("/online-devices", response_model=OnlineDevicesResponse)
def get_online_devices(
    window_minutes: int = Query(default=settings.monitor_active_window_minutes, ge=1, le=120),
    db: Session = Depends(get_db),
):
    threshold = datetime.utcnow() - timedelta(minutes=window_minutes)

    total_query = text(
        """
        SELECT COUNT(*)
        FROM sessions
        WHERE session_scope = 'visitor'
          AND session_state = 'active'
          AND last_activity_at >= :threshold
        """
    )
    total_online = db.execute(total_query, {"threshold": threshold}).scalar_one()

    by_site_query = text(
        """
        SELECT site_id, COUNT(*) AS online_devices
        FROM sessions
        WHERE session_scope = 'visitor'
          AND session_state = 'active'
          AND last_activity_at >= :threshold
        GROUP BY site_id
        ORDER BY online_devices DESC
        """
    )
    rows = db.execute(by_site_query, {"threshold": threshold}).mappings().all()

    return OnlineDevicesResponse(
        window_minutes=window_minutes,
        total_online_devices=total_online,
        by_site=[OnlineBySite(site_id=row["site_id"], online_devices=row["online_devices"]) for row in rows],
    )
