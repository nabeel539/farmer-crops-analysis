"""Pydantic schemas for authentication requests and responses."""

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login with email and password."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class RegisterRequest(BaseModel):
    """Register a new user."""

    name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    mobile: str | None = Field(None, max_length=20)
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(default="FARMER", pattern="^(ADMIN|FIELD_OFFICER|FARMER)$")


class TokenResponse(BaseModel):
    """JWT token response after successful login."""

    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Public user data — never includes password hash."""

    id: str
    name: str
    email: str
    mobile: str | None = None
    role: str
    is_active: bool

    model_config = {"from_attributes": True}
