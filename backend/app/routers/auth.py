from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class HeartbeatRequest(BaseModel):
    session_uuid: str


@router.post("/heartbeat")
def heartbeat(payload: HeartbeatRequest, db: Session = Depends(get_db)):
    result = db.execute(
        text(
            """
            UPDATE sessions
            SET last_activity_at = :now,
                updated_at = :now
            WHERE session_uuid = :session_uuid
              AND session_scope = 'visitor'
              AND session_state = 'active'
            """
        ),
        {"now": datetime.utcnow(), "session_uuid": payload.session_uuid},
    )
    db.commit()

    if result.rowcount == 0:
        return {
            "success": False,
            "data": None,
            "error": {"code": "RESOURCE_NOT_FOUND", "message": "Active visitor session not found"},
        }

    return {"success": True, "data": {"updated": True}, "error": None}
