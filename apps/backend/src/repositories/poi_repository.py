from sqlmodel import Session, select
from typing import List
from models import POI, QRCode, UserProgress

class POIRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_all_pois(self) -> List[POI]:
        return self.session.exec(select(POI)).all()

    def get_poi_by_id(self, poi_id: int) -> POI | None:
        return self.session.get(POI, poi_id)

    def get_poi_by_qr(self, qr_code: str) -> POI | None:
        qr = self.session.exec(select(QRCode).where(QRCode.code == qr_code)).first()
        if qr:
            return qr.poi
        return None

    def create_progress(self, progress: UserProgress) -> UserProgress:
        self.session.add(progress)
        self.session.commit()
        self.session.refresh(progress)
        return progress

    def get_progress_by_user(self, user_id: str) -> List[UserProgress]:
        return self.session.exec(select(UserProgress).where(UserProgress.user_id == user_id)).all()