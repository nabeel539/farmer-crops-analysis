"""Farmer CRUD API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import ConflictException, NotFoundException
from app.dependencies.auth import get_current_user, require_admin, require_admin_or_officer
from app.models.activity import Activity
from app.models.allocation import SeedAllocation
from app.models.crop_cycle import CropCycle
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field
from app.models.harvest import HarvestRecord
from app.models.user import User, UserRole
from app.models.visit import OfficerVisit
from app.schemas.farmer import (
    FarmerCreate,
    FarmerResetCredentialsRequest,
    FarmerResetCredentialsResponse,
    FarmerResponse,
    FarmerUpdate,
)

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.post("", response_model=FarmerResponse, status_code=201)
def create_farmer(
    data: FarmerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Farmer:
    """Register a new farmer with unique mobile number verification. Admin or Field Officer only."""
    clean_mobile = data.mobile_number.strip()
    clean_email = data.email.strip().lower() if data.email else None
    
    # Check if mobile number already exists in Farmers table
    existing_farmer = db.query(Farmer).filter(Farmer.mobile_number == clean_mobile).first()
    if existing_farmer:
        raise ConflictException(
            f"A farmer with mobile number '{clean_mobile}' is already registered ({existing_farmer.name}). Mobile numbers must be unique."
        )

    # Check if email already exists in Farmers table
    if clean_email:
        existing_email_farmer = db.query(Farmer).filter(Farmer.email == clean_email).first()
        if existing_email_farmer:
            raise ConflictException(
                f"A farmer with email '{clean_email}' is already registered ({existing_email_farmer.name}). Email IDs must be unique."
            )

    # Setup login user ID and password (manual or auto-generated)
    import random
    login_user_id = (data.login_user_id.strip() if data.login_user_id else "") or clean_mobile
    login_password = (data.login_password.strip() if data.login_password else "") or f"Kisan@{random.randint(1000, 9999)}"
    farmer_email = login_user_id.lower() if "@" in login_user_id else (clean_email or f"{login_user_id}@krishi.local")

    farmer = Farmer(
        name=data.name.strip(),
        mobile_number=clean_mobile,
        email=clean_email,
        address=data.address,
        village=data.village.strip(),
        block=data.block.strip() if data.block else None,
        district=data.district.strip(),
        state=data.state.strip(),
        status=FarmerStatus(data.status),
        registration_date=data.registration_date or "",
    )
    if not farmer.registration_date:
        from datetime import datetime, timezone
        farmer.registration_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    # Create or update user login account with admin-provided or auto-generated credentials
    from app.core.security import hash_password
    existing_user = db.query(User).filter(
        (User.mobile == login_user_id)
        | (User.mobile == clean_mobile)
        | (User.email == farmer_email)
        | (User.email == f"{clean_mobile}@krishi.local")
    ).first()

    if existing_user:
        existing_user.name = farmer.name
        existing_user.email = farmer_email
        existing_user.mobile = login_user_id
        existing_user.password_hash = hash_password(login_password)
        existing_user.role = UserRole.FARMER
        existing_user.is_active = True
    else:
        new_user = User(
            name=farmer.name,
            email=farmer_email,
            mobile=login_user_id,
            password_hash=hash_password(login_password),
            role=UserRole.FARMER,
            is_active=True,
        )
        db.add(new_user)
    db.commit()

    return farmer


@router.get("", response_model=list[FarmerResponse])
def list_farmers(
    village: str | None = None,
    district: str | None = None,
    status: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Farmer]:
    """List farmers with optional filters and pagination."""
    query = db.query(Farmer)

    if village:
        query = query.filter(Farmer.village.ilike(f"%{village}%"))
    if district:
        query = query.filter(Farmer.district.ilike(f"%{district}%"))
    if status:
        query = query.filter(Farmer.status == FarmerStatus(status))
    if search:
        query = query.filter(
            (Farmer.name.ilike(f"%{search}%")) | (Farmer.mobile_number.ilike(f"%{search}%")) | (Farmer.email.ilike(f"%{search}%"))
        )

    offset = (page - 1) * limit
    return query.order_by(Farmer.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(
    farmer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Farmer:
    """Get a specific farmer by ID."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")
    return farmer


@router.patch("/{farmer_id}", response_model=FarmerResponse)
def update_farmer(
    farmer_id: str,
    data: FarmerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Farmer:
    """Partially update a farmer. Admin or Field Officer only."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    update_data = data.model_dump(exclude_unset=True)
    if "mobile_number" in update_data and update_data["mobile_number"]:
        new_mob = update_data["mobile_number"].strip()
        if new_mob != farmer.mobile_number:
            existing = db.query(Farmer).filter(Farmer.mobile_number == new_mob, Farmer.id != farmer.id).first()
            if existing:
                raise ConflictException(
                    f"Mobile number '{new_mob}' is already registered to farmer {existing.name}."
                )
            update_data["mobile_number"] = new_mob

    if "email" in update_data and update_data["email"]:
        new_email = update_data["email"].strip().lower()
        if new_email != (farmer.email or ""):
            existing = db.query(Farmer).filter(Farmer.email == new_email, Farmer.id != farmer.id).first()
            if existing:
                raise ConflictException(
                    f"Email '{new_email}' is already registered to farmer {existing.name}."
                )
            update_data["email"] = new_email

    if "status" in update_data and update_data["status"]:
        update_data["status"] = FarmerStatus(update_data["status"])

    for key, value in update_data.items():
        setattr(farmer, key, value)

    db.commit()
    db.refresh(farmer)
    return farmer


@router.delete("/{farmer_id}", status_code=204)
def delete_farmer(
    farmer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    """Delete a farmer profile and all dependent records. Admin only."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    mobile = farmer.mobile_number

    # Detach objects so SQLAlchemy unit of work does not emit autoflush NULL updates
    db.expunge_all()

    # Cascade delete all dependent records safely in order
    db.execute(delete(Activity).where(Activity.farmer_id == farmer_id))
    db.execute(delete(OfficerVisit).where(OfficerVisit.farmer_id == farmer_id))
    db.execute(delete(HarvestRecord).where(HarvestRecord.farmer_id == farmer_id))
    db.execute(delete(SeedAllocation).where(SeedAllocation.farmer_id == farmer_id))
    db.execute(delete(CropCycle).where(CropCycle.farmer_id == farmer_id))
    db.execute(delete(Field).where(Field.farmer_id == farmer_id))
    db.execute(delete(User).where((User.mobile == mobile) | (User.email == f"{mobile}@krishi.local")))
    db.execute(delete(Farmer).where(Farmer.id == farmer_id))
    db.commit()


@router.post("/{farmer_id}/reset-credentials", response_model=FarmerResetCredentialsResponse)
def reset_farmer_credentials(
    farmer_id: str,
    data: FarmerResetCredentialsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> dict:
    """Reset or customize farmer login user ID and password (Admin/Officer only)."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    new_user_id = (data.new_user_id.strip() if data.new_user_id else "") or farmer.mobile_number
    new_password = data.new_password.strip()

    old_mobile = farmer.mobile_number
    old_email = (farmer.email or "").strip().lower()

    farmer_email = new_user_id.lower() if "@" in new_user_id else (old_email or f"{new_user_id}@krishi.local")

    from app.core.security import hash_password

    user = (
        db.query(User)
        .filter(
            (User.mobile == old_mobile)
            | (User.email == f"{old_mobile}@krishi.local")
            | (User.mobile == new_user_id)
            | (User.email == f"{new_user_id}@krishi.local")
            | (User.email == old_email)
            | (User.email == farmer_email)
        )
        .first()
    )

    if user:
        user.mobile = new_user_id
        user.email = farmer_email
        user.password_hash = hash_password(new_password)
        user.name = farmer.name
        user.is_active = True
    else:
        user = User(
            name=farmer.name,
            email=farmer_email,
            mobile=new_user_id,
            password_hash=hash_password(new_password),
            role=UserRole.FARMER,
            is_active=True,
        )
        db.add(user)

    db.commit()
    db.refresh(farmer)

    return {
        "farmer_id": farmer.id,
        "farmer_name": farmer.name,
        "user_id": new_user_id,
        "status": "SUCCESS",
        "message": f"Login credentials for {farmer.name} updated successfully.",
    }

