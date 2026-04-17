from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database import get_db
from app.models.user import UserRole
from app.schemas.poi import ApprovalRequest, MenuItemPayload, POICreateRequest, POIUpdateRequest
from app.services import geocode_service, poi_service

router = APIRouter(prefix='/pois', tags=['pois'])


@router.get('')
def list_pois(
    q: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return poi_service.list_pois(db, current_user, q, status, limit, offset)


@router.get('/nearby')
def nearby_pois(
    lat: float,
    lng: float,
    radiusKm: float = Query(default=1.0, ge=0.05, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return poi_service.get_nearby_pois(db, current_user, lat, lng, radiusKm)


@router.get('/geocode/search')
def geocode_search(
    query: str,
    limit: int = Query(default=5, ge=1, le=10),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    return geocode_service.search_addresses(query, limit)


@router.get('/geocode/reverse')
def geocode_reverse(
    lat: float,
    lng: float,
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    return geocode_service.reverse_geocode(lat, lng)


@router.post('')
def create_poi(
    payload: POICreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.owner, UserRole.moderator)),
):
    return poi_service.create_poi(db, current_user, payload)


@router.get('/{poi_id}')
def get_poi(
    poi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return poi_service.get_poi(db, current_user, poi_id)


@router.put('/{poi_id}')
def update_poi(
    poi_id: int,
    payload: POIUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return poi_service.update_poi(db, current_user, poi_id, payload)


@router.delete('/{poi_id}')
def delete_poi(
    poi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    poi_service.delete_poi(db, current_user, poi_id)
    return {'message': 'POI deleted'}


@router.put('/{poi_id}/menu')
def set_menu(
    poi_id: int,
    payload: list[MenuItemPayload],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return poi_service.set_menu(db, current_user, poi_id, payload)


@router.post('/{poi_id}/approve')
def approve_poi(
    poi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    return poi_service.approve_poi(db, poi_id)


@router.post('/{poi_id}/reject')
def reject_poi(
    poi_id: int,
    payload: ApprovalRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    return poi_service.reject_poi(db, poi_id, payload.rejectReason)
