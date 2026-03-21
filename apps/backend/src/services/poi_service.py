from repositories.poi_repository import POIRepository
from schemas.poi_schemas import POIRead, ProgressCreate, ProgressRead
from models import UserProgress
from sqlmodel import select
from datetime import datetime

class POIService:
    def __init__(self, repo: POIRepository):
        self.repo = repo

    def get_all_pois(self) -> List[POIRead]:
        pois = self.repo.get_all_pois()
        return [POIRead.from_orm(poi) for poi in pois]

    def get_poi(self, poi_id: int) -> POIRead | None:
        poi = self.repo.get_poi_by_id(poi_id)
        if poi:
            return POIRead.from_orm(poi)
        return None

    def scan_qr(self, qr_code: str) -> POIRead | None:
        poi = self.repo.get_poi_by_qr(qr_code)
        if poi:
            return POIRead.from_orm(poi)
        return None

    def mark_progress(self, progress: ProgressCreate) -> UserProgress:
        existing = self.repo.session.exec(select(UserProgress).where(UserProgress.user_id == progress.user_id, UserProgress.poi_id == progress.poi_id)).first()
        if existing:
            return existing
        prog = UserProgress(user_id=progress.user_id, poi_id=progress.poi_id, completed_at=datetime.now())
        return self.repo.create_progress(prog)

    def get_user_progress(self, user_id: str) -> List[ProgressRead]:
        progresses = self.repo.get_progress_by_user(user_id)
        return [ProgressRead.from_orm(p) for p in progresses]