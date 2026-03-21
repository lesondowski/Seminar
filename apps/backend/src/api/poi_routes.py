from fastapi import APIRouter, Depends, HTTPException
from typing import List
from services.poi_service import POIService
from repositories.poi_repository import POIRepository
from core.database import get_session
from schemas.poi_schemas import POIRead, ProgressCreate, ProgressRead

router = APIRouter()

def get_poi_service(session = Depends(get_session)) -> POIService:
    repo = POIRepository(session)
    return POIService(repo)

@router.get("/pois", response_model=List[POIRead])
def get_pois(service: POIService = Depends(get_poi_service)):
    return service.get_all_pois()

@router.get("/pois/{poi_id}", response_model=POIRead)
def get_poi(poi_id: int, service: POIService = Depends(get_poi_service)):
    poi = service.get_poi(poi_id)
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return poi

@router.post("/scan", response_model=POIRead)
def scan_qr(qr_code: str, service: POIService = Depends(get_poi_service)):
    poi = service.scan_qr(qr_code)
    if not poi:
        raise HTTPException(status_code=404, detail="QR code not found")
    return poi

@router.post("/progress", response_model=ProgressRead)
def mark_progress(progress: ProgressCreate, service: POIService = Depends(get_poi_service)):
    return service.mark_progress(progress)

@router.get("/progress/{user_id}", response_model=List[ProgressRead])
def get_progress(user_id: str, service: POIService = Depends(get_poi_service)):
    return service.get_user_progress(user_id)