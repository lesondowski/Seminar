from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from uuid import uuid4

from jose import jwt

from app.config import get_settings

settings = get_settings()


def create_access_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload: Dict[str, Any] = {
        'sub': subject,
        'role': role,
        'type': 'access',
        'exp': expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.refresh_token_expire_days)
    )
    payload: Dict[str, Any] = {
        'sub': subject,
        'role': role,
        'type': 'refresh',
        'jti': str(uuid4()),
        'exp': expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
