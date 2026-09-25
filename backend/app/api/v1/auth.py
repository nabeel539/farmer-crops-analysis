"""Authentication API routes — login, register, current user."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)) -> User:
    """Register a new user account."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise ConflictException("A user with this email already exists")

    # Check if mobile already exists (if provided)
    if data.mobile:
        existing_mobile = db.query(User).filter(User.mobile == data.mobile).first()
        if existing_mobile:
            raise ConflictException("A user with this mobile number already exists")

    user = User(
        name=data.name,
        email=data.email,
        mobile=data.mobile,
        password_hash=hash_password(data.password),
        role=UserRole(data.role),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> dict:
    """Authenticate and receive a JWT access token."""
    # Allow login with email or mobile/user_id
    ident = data.email.strip()
    user = (
        db.query(User)
        .filter(
            (User.email == ident)
            | (User.mobile == ident)
            | (User.email == f"{ident}@krishi.local")
        )
        .first()
    )
    if not user or not verify_password(data.password, user.password_hash):
        raise UnauthorizedException("Invalid user ID / email or password")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Get the currently authenticated user's profile."""
    return current_user
