from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.tour import Tour
from app.schemas.tour import TourCreateRequest, TourUpdateRequest


def _tour_to_dict(tour: Tour) -> dict:
    return {
        'id': tour.id,
        'name': tour.name,
        'description': tour.description,
        'language': tour.language,
        'status': tour.status,
        'duration': tour.duration,
        'pois': tour.poi_ids,
        'updatedAt': tour.updated_at.date().isoformat(),
    }


def list_tours(db: Session, limit: int, offset: int) -> list[dict]:
    tours = db.query(Tour).order_by(Tour.id.desc()).offset(offset).limit(limit).all()
    return [_tour_to_dict(tour) for tour in tours]


def get_tour(db: Session, tour_id: int) -> dict:
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tour not found')
    return _tour_to_dict(tour)


def create_tour(db: Session, payload: TourCreateRequest) -> dict:
    tour = Tour(
        name=payload.name,
        description=payload.description,
        language=payload.language,
        status=payload.status,
        duration=payload.duration,
        poi_ids=payload.pois,
    )
    db.add(tour)
    db.commit()
    db.refresh(tour)
    return _tour_to_dict(tour)


def update_tour(db: Session, tour_id: int, payload: TourUpdateRequest) -> dict:
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tour not found')

    data = payload.model_dump(exclude_none=True)
    mapping = {
        'name': 'name',
        'description': 'description',
        'language': 'language',
        'status': 'status',
        'duration': 'duration',
        'pois': 'poi_ids',
    }

    for incoming_key, model_key in mapping.items():
        if incoming_key in data:
            setattr(tour, model_key, data[incoming_key])

    db.commit()
    db.refresh(tour)
    return _tour_to_dict(tour)


def delete_tour(db: Session, tour_id: int) -> None:
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tour not found')

    db.delete(tour)
    db.commit()
