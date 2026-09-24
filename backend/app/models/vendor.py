"""Vendor model for seed supplier management."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VendorStatus(str, enum.Enum):
    """Vendor operational status."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Vendor(Base):
    """Seed supplier/vendor entity."""

    __tablename__ = "vendors"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    vendor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[VendorStatus] = mapped_column(
        Enum(VendorStatus, name="vendor_status_enum"), nullable=False, default=VendorStatus.ACTIVE
    )
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
    seed_supplies = relationship("SeedSupply", back_populates="vendor", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Vendor {self.vendor_name}>"
