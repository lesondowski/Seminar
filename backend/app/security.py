from datetime import datetime, timedelta, timezone
import hashlib
import secrets

import jwt

from app.config import settings


def utcnow():
    return datetime.now(timezone.utc)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(session_uuid: str, scope: str, ttl_minutes: int = 30) -> str:
    exp = utcnow() + timedelta(minutes=ttl_minutes)
    payload = {
        "sub": session_uuid,
        "scope": scope,
        "exp": int(exp.timestamp()),
        "iat": int(utcnow().timestamp()),
        "jti": secrets.token_hex(8),
    }
    return jwt.encode(payload, settings.jwt_access_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(session_uuid: str, scope: str, ttl_days: int = 7) -> str:
    exp = utcnow() + timedelta(days=ttl_days)
    payload = {
        "sub": session_uuid,
        "scope": scope,
        "exp": int(exp.timestamp()),
        "iat": int(utcnow().timestamp()),
        "jti": secrets.token_hex(16),
    }
    return jwt.encode(payload, settings.jwt_refresh_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_access_secret, algorithms=[settings.jwt_algorithm])


def decode_refresh_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_refresh_secret, algorithms=[settings.jwt_algorithm])
