from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import require_roles
from app.config import get_settings
from app.models.user import UserRole

router = APIRouter(prefix='/uploads', tags=['uploads'])
settings = get_settings()


@router.post('')
def upload(
    file: UploadFile = File(...),
    current_user=Depends(require_roles(UserRole.admin, UserRole.moderator, UserRole.owner)),
):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Only image files are allowed')

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or '').suffix
    new_name = f'{uuid4().hex}{suffix}'
    destination = upload_dir / new_name

    with destination.open('wb') as f:
        f.write(file.file.read())

    return {
        'filename': new_name,
        'url': f'/static/{new_name}',
        'contentType': file.content_type,
    }
