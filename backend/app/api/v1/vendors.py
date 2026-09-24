"""Vendor CRUD API routes — Admin only."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.dependencies.auth import require_admin
from app.models.user import User
from app.models.vendor import Vendor, VendorStatus
from app.schemas.vendor import VendorCreate, VendorResponse, VendorUpdate

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("", response_model=VendorResponse, status_code=201)
def create_vendor(
    data: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Vendor:
    """Create a new vendor. Admin only."""
    vendor = Vendor(
        vendor_name=data.vendor_name,
        company_name=data.company_name,
        contact_person=data.contact_person,
        mobile_number=data.mobile_number,
        email=data.email,
        address=data.address,
        gstin=data.gstin,
        status=VendorStatus(data.status),
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("", response_model=list[VendorResponse])
def list_vendors(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[Vendor]:
    """List all vendors. Optionally filter by status. Admin only."""
    query = db.query(Vendor)
    if status:
        query = query.filter(Vendor.status == VendorStatus(status))
    return query.order_by(Vendor.created_at.desc()).all()


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Vendor:
    """Get a specific vendor by ID. Admin only."""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise NotFoundException("Vendor not found")
    return vendor


@router.patch("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: str,
    data: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Vendor:
    """Partially update a vendor. Admin only."""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise NotFoundException("Vendor not found")

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"]:
        update_data["status"] = VendorStatus(update_data["status"])

    for key, value in update_data.items():
        setattr(vendor, key, value)

    db.commit()
    db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=204)
def delete_vendor(
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> None:
    """Soft-delete a vendor by setting status to INACTIVE. Admin only."""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise NotFoundException("Vendor not found")

    # Soft delete: mark as inactive instead of physical deletion
    vendor.status = VendorStatus.INACTIVE
    db.commit()
