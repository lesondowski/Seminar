from fastapi import APIRouter
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from fastapi import Depends

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"success": True, "data": {"status": "ok"}, "error": None}
