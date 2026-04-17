from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem
from app.models.poi import POI, POIStatus
from app.models.user import User, UserRole
from app.schemas.poi import MenuItemPayload, POICreateRequest, POIUpdateRequest
from app.utils.geolocation import distance_km


def _poi_to_dict(poi: POI) -> dict:
    return {
        'id': poi.id,
        'name': poi.name,
        'description': poi.description,
        'price': poi.price,
        'image': poi.image,
        'category': poi.category,
        'location': {'lat': poi.lat, 'lng': poi.lng},
        'rating': poi.rating,
        'phone': poi.phone,
        'website': poi.website,
        'audio': poi.audio,
        'narration': {
            'sourceLanguage': poi.narration_source_language,
            'content': poi.narration_content,
        },
        'hours': poi.hours,
        'address': poi.address,
        'status': poi.status.value,
        'rejectReason': poi.reject_reason,
        'createdAt': poi.created_at.date().isoformat(),
        'createdBy': poi.owner.email if poi.owner else '',
        'createdById': poi.created_by,
        'createdByUser': poi.creator.email if poi.creator else '',
        'menu': [
            {
                'id': str(item.id),
                'name': {'vi': item.name_vi, 'en': item.name_en, 'zh': item.name_zh},
                'description': {
                    'vi': item.description_vi,
                    'en': item.description_en,
                    'zh': item.description_zh,
                },
                'price': item.price,
                'currency': item.currency,
                'image': item.image,
                'category': item.category,
            }
            for item in poi.menu_items
        ],
    }


def _check_read_permission(user: User, poi: POI) -> None:
    if poi.status == POIStatus.approved:
        return

    if user.role in (UserRole.admin, UserRole.moderator):
        return

    if poi.owner_id == user.id:
        return

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='POI is not visible')


def _check_write_permission(user: User, poi: POI) -> None:
    if user.role == UserRole.admin:
        return

    if user.role == UserRole.moderator and poi.created_by == user.id:
        return

    if user.role == UserRole.owner and poi.owner_id == user.id:
        return

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='No permission to modify this POI')


def list_pois(db: Session, user: User, q: str | None, status_filter: str | None, limit: int, offset: int) -> list[dict]:
    query = db.query(POI)

    if q:
        like_value = f'%{q}%'
        query = query.filter(POI.name.like(like_value))

    if user.role in (UserRole.admin, UserRole.moderator):
        if status_filter:
            query = query.filter(POI.status == POIStatus(status_filter))
    elif user.role == UserRole.owner:
        if status_filter:
            query = query.filter(POI.owner_id == user.id, POI.status == POIStatus(status_filter))
        else:
            # Owner can browse approved POIs and manage all statuses of their own POIs.
            query = query.filter(or_(POI.status == POIStatus.approved, POI.owner_id == user.id))
    else:
        if status_filter:
            query = query.filter(POI.status == POIStatus(status_filter))
        else:
            query = query.filter(POI.status == POIStatus.approved)

    pois = query.order_by(POI.id.desc()).offset(offset).limit(limit).all()
    return [_poi_to_dict(poi) for poi in pois]


def get_poi(db: Session, user: User, poi_id: int) -> dict:
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='POI not found')

    _check_read_permission(user, poi)
    return _poi_to_dict(poi)


def create_poi(db: Session, user: User, payload: POICreateRequest) -> dict:
    poi = POI(
        name=payload.name,
        description=payload.description,
        price=payload.price,
        image=payload.image,
        category=payload.category,
        lat=payload.location.lat,
        lng=payload.location.lng,
        rating=payload.rating,
        phone=payload.phone,
        website=payload.website,
        audio=payload.audio,
        narration_source_language=payload.narration.sourceLanguage,
        narration_content=payload.narration.content,
        hours=payload.hours,
        address=payload.address,
        owner_id=user.id,
        created_by=user.id,
        status=POIStatus.pending,
    )
    db.add(poi)
    db.flush()

    for menu in payload.menu:
        poi.menu_items.append(_build_menu_item(menu))

    db.commit()
    db.refresh(poi)
    return _poi_to_dict(poi)


def update_poi(db: Session, user: User, poi_id: int, payload: POIUpdateRequest) -> dict:
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='POI not found')

    _check_write_permission(user, poi)

    data = payload.model_dump(exclude_none=True)

    if 'location' in data:
        poi.lat = data['location']['lat']
        poi.lng = data['location']['lng']

    if 'narration' in data:
        poi.narration_source_language = data['narration']['sourceLanguage']
        poi.narration_content = data['narration']['content']

    mapping = {
        'name': 'name',
        'description': 'description',
        'price': 'price',
        'image': 'image',
        'category': 'category',
        'rating': 'rating',
        'phone': 'phone',
        'website': 'website',
        'audio': 'audio',
        'hours': 'hours',
        'address': 'address',
        'rejectReason': 'reject_reason',
    }

    for incoming_key, model_field in mapping.items():
        if incoming_key in data:
            setattr(poi, model_field, data[incoming_key])

    if 'status' in data and user.role in (UserRole.admin, UserRole.moderator):
        poi.status = POIStatus(data['status'])

    if 'menu' in data:
        poi.menu_items.clear()
        for menu in payload.menu or []:
            poi.menu_items.append(_build_menu_item(menu))

    db.commit()
    db.refresh(poi)
    return _poi_to_dict(poi)


def delete_poi(db: Session, user: User, poi_id: int) -> None:
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='POI not found')

    _check_write_permission(user, poi)
    db.delete(poi)
    db.commit()


def approve_poi(db: Session, poi_id: int) -> dict:
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='POI not found')

    poi.status = POIStatus.approved
    poi.reject_reason = ''
    db.commit()
    db.refresh(poi)
    return _poi_to_dict(poi)


def reject_poi(db: Session, poi_id: int, reason: str) -> dict:
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='POI not found')

    poi.status = POIStatus.rejected
    poi.reject_reason = reason
    db.commit()
    db.refresh(poi)
    return _poi_to_dict(poi)


def set_menu(db: Session, user: User, poi_id: int, menu_items: list[MenuItemPayload]) -> list[dict]:
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='POI not found')

    _check_write_permission(user, poi)

    poi.menu_items.clear()
    for menu in menu_items:
        poi.menu_items.append(_build_menu_item(menu))

    db.commit()
    db.refresh(poi)

    return _poi_to_dict(poi)['menu']


def get_nearby_pois(db: Session, user: User, lat: float, lng: float, radius_km: float) -> list[dict]:
    pois = db.query(POI).all()
    visible = []
    for poi in pois:
        try:
            _check_read_permission(user, poi)
        except HTTPException:
            continue

        dist = distance_km(lat, lng, poi.lat, poi.lng)
        if dist <= radius_km:
            item = _poi_to_dict(poi)
            item['distanceKm'] = round(dist, 4)
            visible.append(item)

    return sorted(visible, key=lambda item: item['distanceKm'])


def _build_menu_item(menu: MenuItemPayload) -> MenuItem:
    return MenuItem(
        name_vi=menu.name.vi,
        name_en=menu.name.en,
        name_zh=menu.name.zh,
        description_vi=menu.description.vi,
        description_en=menu.description.en,
        description_zh=menu.description.zh,
        price=menu.price,
        currency=menu.currency,
        image=menu.image,
        category=menu.category,
    )
