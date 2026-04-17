from datetime import timedelta

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.config import get_settings
from app.database import get_db
from app.models.user import UserRole
from app.schemas.auth import (
    AdminCreateUserRequest,
    AdminCreateUserResponse,
    AdminUserListResponse,
    AuthResponse,
    LoginRequest,
    ProfileResponse,
    RefreshResponse,
    SendOTPRequest,
    VerifyOTPRequest,
)
from app.services import auth_service

router = APIRouter(prefix='/auth', tags=['auth'])
settings = get_settings()


class OTPResponse(BaseModel):
    success: bool
    message: str
    email: str


@router.post('/send-otp', response_model=OTPResponse)
def send_otp(payload: SendOTPRequest):
    return auth_service.send_otp(payload.email)


@router.post('/verify-otp')
def verify_otp(payload: VerifyOTPRequest):
    return auth_service.verify_otp(payload.email, payload.otp)


@router.post('/login', response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    data = auth_service.login(
        db=db,
        email=payload.email,
        language=payload.language,
        otp_verified=payload.otp_verified,
    )

    refresh_token = data.pop('refresh_token')
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite='lax',
        max_age=settings.refresh_token_expire_days * 24 * 3600,
    )

    return data


@router.post('/refresh', response_model=RefreshResponse)
def refresh_token(refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail='Missing refresh token cookie')

    token = auth_service.refresh_access_token(refresh_token)
    return {'access_token': token, 'token_type': 'bearer'}


@router.post('/logout')
def logout(response: Response, refresh_token: str | None = Cookie(default=None)):
    if refresh_token:
        auth_service.revoke_refresh_token(refresh_token)

    response.delete_cookie('refresh_token')
    return {'message': 'Logged out'}


@router.get('/profile', response_model=ProfileResponse)
def profile(current_user=Depends(get_current_user)):
    return {
        'email': current_user.email,
        'language': current_user.language,
        'role': current_user.role.value,
    }


@router.post('/admin/users', response_model=AdminCreateUserResponse)
def admin_create_user(
    payload: AdminCreateUserRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin)),
):
    return auth_service.admin_create_or_update_user(
        db=db,
        email=payload.email,
        language=payload.language,
        role=payload.role,
    )


@router.get('/admin/users', response_model=AdminUserListResponse)
def admin_list_users(current_user=Depends(require_roles(UserRole.admin)), db: Session = Depends(get_db)):
    return auth_service.admin_list_users(db)
