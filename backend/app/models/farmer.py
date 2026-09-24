"""Farmer model."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FarmerStatus(str, enum.Enum):
    """Farmer registration status."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"


class Farmer(Base):
    """Farmer entity — separate from User for data integrity."""

    __tablename__ = "farmers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    village: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    block: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[FarmerStatus] = mapped_column(
        Enum(FarmerStatus, name="farmer_status_enum"),
        nullable=False,
        default=FarmerStatus.ACTIVE,
    )
    registration_date: Mapped[str] = mapped_column(
        String(20), nullable=False, default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d")
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
    fields = relationship("Field", back_populates="farmer", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Farmer {self.name} village={self.village}>"
