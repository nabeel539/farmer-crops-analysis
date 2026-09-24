"""Seed allocation model — links seed batches to farmer fields."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SeedAllocation(Base):
    """Allocation of seed from a batch to a specific farmer's field."""

    __tablename__ = "seed_allocations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    seed_batch_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("seed_batches.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    farmer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    field_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("fields.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="KG")
    allocation_date: Mapped[str] = mapped_column(
        String(20), nullable=False, default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d")
    )
    allocated_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    seed_batch = relationship("SeedBatch", back_populates="allocations")
    farmer = relationship("Farmer")
    field = relationship("Field", back_populates="allocations")

    def __repr__(self) -> str:
        return f"<SeedAllocation batch={self.seed_batch_id} farmer={self.farmer_id} qty={self.quantity}>"
