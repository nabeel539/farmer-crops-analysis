"""Seed Supply, Batch, and Inventory API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import BadRequestException, NotFoundException
from app.dependencies.auth import require_admin
from app.models.seed import SeedBatch, SeedSupply
from app.models.user import User
from app.models.vendor import Vendor
from app.schemas.seed import SeedBatchResponse, SeedSupplyCreate, SeedSupplyResponse

router = APIRouter(prefix="/seeds", tags=["Seed Supply & Inventory"])


@router.post("/supplies", response_model=SeedSupplyResponse, status_code=201)
def create_seed_supply(
    data: SeedSupplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SeedSupply:
    """
    Record a new seed supply from a vendor.

    Automatically creates a SeedBatch with full inventory tracking.
    """
    # Validate vendor exists
    vendor = db.query(Vendor).filter(Vendor.id == data.vendor_id).first()
    if not vendor:
        raise NotFoundException("Vendor not found")

    # Check for existing batch number to prevent database integrity error
    existing_batch = db.query(SeedBatch).filter(SeedBatch.batch_number == data.batch_number).first()
    if existing_batch:
        raise BadRequestException(f"Seed batch '{data.batch_number}' already exists in inventory.")

    try:
        # Create the supply record
        supply = SeedSupply(
            vendor_id=data.vendor_id,
            crop=data.crop,
            variety=data.variety,
            supply_date=data.supply_date,
            purchase_reference=data.purchase_reference,
            remarks=data.remarks,
        )
        db.add(supply)
        db.flush()  # Get supply.id for the batch

        # Auto-create a seed batch with inventory
        batch = SeedBatch(
            supply_id=supply.id,
            batch_number=data.batch_number,
            quantity=data.quantity,
            unit=data.unit,
            received_quantity=data.quantity,
            allocated_quantity=0.0,
            available_quantity=data.quantity,
        )
        db.add(batch)
        db.commit()
        db.refresh(supply)
        return supply
    except Exception as e:
        db.rollback()
        raise BadRequestException(f"Failed to record seed supply: {str(e)}")


@router.get("/supplies", response_model=list[SeedSupplyResponse])
def list_seed_supplies(
    vendor_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[SeedSupply]:
    """List all seed supplies. Optionally filter by vendor. Admin only."""
    query = db.query(SeedSupply)
    if vendor_id:
        query = query.filter(SeedSupply.vendor_id == vendor_id)
    return query.order_by(SeedSupply.created_at.desc()).all()


@router.get("/batches", response_model=list[SeedBatchResponse])
def list_seed_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[SeedBatch]:
    """List all seed batches with current inventory levels. Admin only."""
    return db.query(SeedBatch).order_by(SeedBatch.created_at.desc()).all()


@router.get("/batches/{batch_id}", response_model=SeedBatchResponse)
def get_seed_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SeedBatch:
    """Get a specific seed batch with inventory details. Admin only."""
    batch = db.query(SeedBatch).filter(SeedBatch.id == batch_id).first()
    if not batch:
        raise NotFoundException("Seed batch not found")
    return batch
