from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    language: str = 'vi'
    otp_verified: bool = False


class AuthResponse(BaseModel):
    success: bool = True
    email: str
    language: str
    role: str
    access_token: str
    token_type: str = 'bearer'


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class ProfileResponse(BaseModel):
    email: str
    language: str
    role: str


class AdminCreateUserRequest(BaseModel):
    email: EmailStr
    language: str = 'vi'
    role: Literal['visitor', 'owner', 'moderator'] = 'owner'


class AdminCreateUserResponse(BaseModel):
    success: bool = True
    message: str
    email: str
    language: str
    role: str


class AdminUserItem(BaseModel):
    id: int
    email: str
    language: str
    role: str
    created_at: str


class AdminUserListResponse(BaseModel):
    users: list[AdminUserItem]
