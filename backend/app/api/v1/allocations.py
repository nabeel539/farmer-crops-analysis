"""Seed Allocation API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.user import User
from app.models.allocation import SeedAllocation
from app.schemas.seed import SeedAllocationCreate, SeedAllocationResponse
from app.services.allocation_service import allocate_seed

router = APIRouter(prefix="/seed-allocations", tags=["Seed Allocations"])


@router.post("", response_model=SeedAllocationResponse, status_code=201)
def create_allocation(
    data: SeedAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SeedAllocation:
    """
    Allocate seed from a batch to a farmer's field.

    This is an atomic operation: the allocation record and inventory update
    either both succeed or both fail.
    """
    allocation = allocate_seed(db, data, allocated_by_user_id=current_user.id)
    db.commit()
    db.refresh(allocation)
    return allocation


@router.get("", response_model=list[SeedAllocationResponse])
def list_allocations(
    farmer_id: str | None = None,
    field_id: str | None = None,
    seed_batch_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[SeedAllocation]:
    """List seed allocations with optional filters. Admin only."""
    query = db.query(SeedAllocation)
    if farmer_id:
        query = query.filter(SeedAllocation.farmer_id == farmer_id)
    if field_id:
        query = query.filter(SeedAllocation.field_id == field_id)
    if seed_batch_id:
        query = query.filter(SeedAllocation.seed_batch_id == seed_batch_id)
    return query.order_by(SeedAllocation.created_at.desc()).all()
