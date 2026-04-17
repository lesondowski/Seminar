from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database import get_db
from app.models.user import UserRole
from app.schemas.tour import TourCreateRequest, TourUpdateRequest
from app.services import tour_service

router = APIRouter(prefix='/tours', tags=['tours'])


@router.get('')
def list_tours(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return tour_service.list_tours(db, limit, offset)


@router.post('')
def create_tour(
    payload: TourCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    return tour_service.create_tour(db, payload)


@router.get('/{tour_id}')
def get_tour(
    tour_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return tour_service.get_tour(db, tour_id)


@router.put('/{tour_id}')
def update_tour(
    tour_id: int,
    payload: TourUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    return tour_service.update_tour(db, tour_id, payload)


@router.delete('/{tour_id}')
def delete_tour(
    tour_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    tour_service.delete_tour(db, tour_id)
    return {'message': 'Tour deleted'}
