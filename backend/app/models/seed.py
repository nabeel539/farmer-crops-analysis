"""Seed supply, batch, and inventory models for seed traceability."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SeedSupply(Base):
    """A record of seed supplied by a vendor."""

    __tablename__ = "seed_supplies"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("vendors.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    crop: Mapped[str] = mapped_column(String(100), nullable=False)
    variety: Mapped[str] = mapped_column(String(100), nullable=False)
    supply_date: Mapped[str] = mapped_column(String(20), nullable=False)
    purchase_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    vendor = relationship("Vendor", back_populates="seed_supplies")
    seed_batches = relationship("SeedBatch", back_populates="seed_supply", lazy="selectin")

    def __repr__(self) -> str:
        return f"<SeedSupply vendor={self.vendor_id} crop={self.crop}>"


class SeedBatch(Base):
    """Individual seed batch from a supply, with inventory tracking."""

    __tablename__ = "seed_batches"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    supply_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("seed_supplies.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    batch_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="KG")

    # Inventory tracking
    received_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    allocated_quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    available_quantity: Mapped[float] = mapped_column(Float, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    seed_supply = relationship("SeedSupply", back_populates="seed_batches")
    allocations = relationship("SeedAllocation", back_populates="seed_batch", lazy="selectin")

    __table_args__ = (
        CheckConstraint("received_quantity >= 0", name="ck_received_qty_positive"),
        CheckConstraint("allocated_quantity >= 0", name="ck_allocated_qty_positive"),
        CheckConstraint("available_quantity >= 0", name="ck_available_qty_non_negative"),
        CheckConstraint(
            "allocated_quantity <= received_quantity",
            name="ck_allocated_lte_received",
        ),
    )

    def __repr__(self) -> str:
        return f"<SeedBatch {self.batch_number} avail={self.available_quantity}>"
