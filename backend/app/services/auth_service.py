import hashlib
import json
from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import User, UserRole
from app.redis_client import redis_client
from app.utils.otp import generate_otp
from app.utils.security import create_access_token, create_refresh_token, decode_token

settings = get_settings()

OTP_TTL_SECONDS = 300
OTP_MAX_ATTEMPTS = 3


def _otp_key(email: str) -> str:
    return f'otp:{email.lower()}'


def _refresh_key(jti: str) -> str:
    return f'refresh:{jti}'


def get_or_create_user(db: Session, email: str, language: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.language = language or user.language
        db.commit()
        db.refresh(user)
        return user

    role = UserRole.visitor
    normalized = email.lower()
    if normalized == 'admin@gmail.com':
        role = UserRole.admin
    elif normalized == 'moderator@gmail.com':
        role = UserRole.moderator

    user = User(email=email, language=language, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def admin_create_or_update_user(db: Session, email: str, language: str, role: str) -> dict:
    target_role = UserRole(role)
    if target_role == UserRole.admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Cannot create admin via this endpoint')

    user = db.query(User).filter(User.email == email).first()
    if user:
        user.language = language or user.language
        user.role = target_role
        db.commit()
        db.refresh(user)
        return {
            'success': True,
            'message': 'User updated successfully',
            'email': user.email,
            'language': user.language,
            'role': user.role.value,
        }

    user = User(email=email, language=language, role=target_role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        'success': True,
        'message': 'User created successfully',
        'email': user.email,
        'language': user.language,
        'role': user.role.value,
    }


def admin_list_users(db: Session) -> dict:
    users = (
        db.query(User)
        .filter(User.role != UserRole.admin)
        .order_by(User.created_at.desc())
        .all()
    )

    return {
        'users': [
            {
                'id': user.id,
                'email': user.email,
                'language': user.language,
                'role': user.role.value,
                'created_at': user.created_at.isoformat(),
            }
            for user in users
        ]
    }


def send_otp(email: str) -> dict:
    code = generate_otp()
    payload = {
        'otp': code,
        'attempts': 0,
    }
    redis_client.setex(_otp_key(email), OTP_TTL_SECONDS, json.dumps(payload))

    # TODO: integrate email provider; logging now for development.
    print(f'[OTP] {email}: {code}')

    return {
        'success': True,
        'message': 'OTP sent successfully',
        'email': email,
    }


def verify_otp(email: str, otp: str) -> dict:
    raw = redis_client.get(_otp_key(email))
    if not raw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='OTP does not exist or expired')

    payload = json.loads(raw)
    attempts = int(payload.get('attempts', 0))

    if attempts >= OTP_MAX_ATTEMPTS:
        redis_client.delete(_otp_key(email))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Too many attempts')

    if payload.get('otp') != otp:
        payload['attempts'] = attempts + 1
        ttl = redis_client.ttl(_otp_key(email))
        redis_client.setex(_otp_key(email), max(ttl, 1), json.dumps(payload))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Incorrect OTP. Remaining attempts: {OTP_MAX_ATTEMPTS - payload["attempts"]}',
        )

    redis_client.delete(_otp_key(email))
    verification_token = hashlib.sha256(f'{email}:{otp}'.encode('utf-8')).hexdigest()

    return {
        'success': True,
        'message': 'OTP verified successfully',
        'email': email,
        'verificationToken': verification_token,
    }


def login(db: Session, email: str, language: str, otp_verified: bool) -> dict:
    if not otp_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='OTP verification required')

    user = get_or_create_user(db, email=email, language=language)

    access_token = create_access_token(subject=user.email, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.email, role=user.role.value)
    refresh_payload = decode_token(refresh_token)

    jti = refresh_payload.get('jti')
    if jti:
        redis_client.setex(_refresh_key(jti), settings.refresh_token_expire_days * 24 * 3600, user.email)

    return {
        'success': True,
        'email': user.email,
        'language': user.language,
        'role': user.role.value,
        'access_token': access_token,
        'refresh_token': refresh_token,
    }


def refresh_access_token(refresh_token: str) -> str:
    try:
        payload = decode_token(refresh_token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token') from exc

    if payload.get('type') != 'refresh':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token type')

    jti = payload.get('jti')
    subject = payload.get('sub')
    role = payload.get('role')
    if not jti or not subject or not role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token payload')

    if redis_client.get(_refresh_key(jti)) != subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Refresh token revoked')

    return create_access_token(subject=subject, role=role, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))


def revoke_refresh_token(refresh_token: str) -> None:
    try:
        payload = decode_token(refresh_token)
    except Exception:
        return

    jti = payload.get('jti')
    if jti:
        redis_client.delete(_refresh_key(jti))
