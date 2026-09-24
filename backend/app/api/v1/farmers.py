"""Farmer CRUD API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.dependencies.auth import require_admin_or_officer
from app.models.farmer import Farmer, FarmerStatus
from app.models.user import User
from app.schemas.farmer import FarmerCreate, FarmerResponse, FarmerUpdate

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.post("", response_model=FarmerResponse, status_code=201)
def create_farmer(
    data: FarmerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Farmer:
    """Register a new farmer. Admin or Field Officer only."""
    farmer = Farmer(
        name=data.name,
        mobile_number=data.mobile_number,
        address=data.address,
        village=data.village,
        block=data.block,
        district=data.district,
        state=data.state,
        status=FarmerStatus(data.status),
        registration_date=data.registration_date or "",
    )
    if not farmer.registration_date:
        from datetime import datetime, timezone
        farmer.registration_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer


@router.get("", response_model=list[FarmerResponse])
def list_farmers(
    village: str | None = None,
    district: str | None = None,
    status: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> list[Farmer]:
    """List farmers with optional filters and pagination. Admin or Field Officer only."""
    query = db.query(Farmer)

    if village:
        query = query.filter(Farmer.village.ilike(f"%{village}%"))
    if district:
        query = query.filter(Farmer.district.ilike(f"%{district}%"))
    if status:
        query = query.filter(Farmer.status == FarmerStatus(status))
    if search:
        query = query.filter(
            (Farmer.name.ilike(f"%{search}%")) | (Farmer.mobile_number.ilike(f"%{search}%"))
        )

    offset = (page - 1) * limit
    return query.order_by(Farmer.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(
    farmer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Farmer:
    """Get a specific farmer by ID. Admin or Field Officer only."""
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
    if "status" in update_data and update_data["status"]:
        update_data["status"] = FarmerStatus(update_data["status"])

    for key, value in update_data.items():
        setattr(farmer, key, value)

    db.commit()
    db.refresh(farmer)
    return farmer
