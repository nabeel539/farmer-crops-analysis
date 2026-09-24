"""Authentication and authorization dependencies for route protection."""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from app.models.user import User, UserRole

security_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from the JWT token."""
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise UnauthorizedException("Invalid or expired token")

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise UnauthorizedException("Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UnauthorizedException("User not found")
    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require the current user to have ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Admin access required")
    return current_user


def require_admin_or_officer(current_user: User = Depends(get_current_user)) -> User:
    """Require the current user to have ADMIN or FIELD_OFFICER role."""
    if current_user.role not in (UserRole.ADMIN, UserRole.FIELD_OFFICER):
        raise ForbiddenException("Admin or Field Officer access required")
    return current_user
