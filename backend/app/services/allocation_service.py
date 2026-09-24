"""Seed allocation service — handles atomic allocation + inventory update."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.allocation import SeedAllocation
from app.models.farmer import Farmer
from app.models.field import Field
from app.models.seed import SeedBatch
from app.schemas.seed import SeedAllocationCreate


def allocate_seed(
    db: Session,
    data: SeedAllocationCreate,
    allocated_by_user_id: str | None = None,
) -> SeedAllocation:
    """
    Allocate seed from a batch to a farmer's field.

    This operation is atomic: allocation creation and inventory update
    happen within the same database transaction. If any validation fails
    or the inventory update violates constraints, the entire operation
    is rolled back.
    """
    # 1. Validate seed batch exists
    batch = db.query(SeedBatch).filter(SeedBatch.id == data.seed_batch_id).first()
    if not batch:
        raise NotFoundException("Seed batch not found")

    # 2. Validate farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == data.farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    # 3. Validate field exists
    field = db.query(Field).filter(Field.id == data.field_id).first()
    if not field:
        raise NotFoundException("Field not found")

    # 4. Validate field belongs to farmer
    if field.farmer_id != data.farmer_id:
        raise BadRequestException("Field does not belong to the specified farmer")

    # 5. Validate quantity is positive
    if data.quantity <= 0:
        raise BadRequestException("Allocation quantity must be positive")

    # 6. Validate sufficient available quantity
    if batch.available_quantity < data.quantity:
        raise BadRequestException(
            f"Insufficient inventory. Available: {batch.available_quantity} {batch.unit}, "
            f"Requested: {data.quantity} {data.unit}"
        )

    # 7. Create allocation and update inventory atomically
    allocation = SeedAllocation(
        seed_batch_id=data.seed_batch_id,
        farmer_id=data.farmer_id,
        field_id=data.field_id,
        quantity=data.quantity,
        unit=data.unit or batch.unit,
        allocation_date=data.allocation_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        allocated_by=allocated_by_user_id,
        remarks=data.remarks,
    )

    # Update inventory
    batch.allocated_quantity += data.quantity
    batch.available_quantity -= data.quantity

    db.add(allocation)
    db.flush()  # Flush to trigger DB constraints before commit

    return allocation
