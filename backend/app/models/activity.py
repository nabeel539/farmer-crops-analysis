"""Field activity model — tracks agronomic operations, fertilizers, irrigation, sprays."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ActivityType(str, enum.Enum):
    """Agronomic field operation categories."""
    IRRIGATION = "IRRIGATION"
    FERTILIZER_UREA = "FERTILIZER_UREA"
    FERTILIZER_DAP = "FERTILIZER_DAP"
    FERTILIZER_POTASH = "FERTILIZER_POTASH"
    PESTICIDE_SPRAY = "PESTICIDE_SPRAY"
    WEEDICIDE_SPRAY = "WEEDICIDE_SPRAY"
    FIELD_VISIT_INSPECTION = "FIELD_VISIT_INSPECTION"
    SOIL_TEST = "SOIL_TEST"
    NDVI_ASSESSMENT = "NDVI_ASSESSMENT"


class ActivityStatus(str, enum.Enum):
    """Lifecycle status of field operation."""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class Activity(Base):
    """Agronomic operation logged for a specific crop cycle and parcel."""

    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    crop_cycle_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("crop_cycles.id", ondelete="CASCADE"), nullable=True, index=True
    )
    farmer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    field_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("fields.id", ondelete="SET NULL"), nullable=True, index=True
    )
    activity_type: Mapped[ActivityType] = mapped_column(
        Enum(ActivityType, name="activity_type_enum"),
        nullable=False,
        default=ActivityType.IRRIGATION,
    )
    scheduled_date: Mapped[str] = mapped_column(String(20), nullable=False)
    executed_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[ActivityStatus] = mapped_column(
        Enum(ActivityStatus, name="activity_status_enum"),
        nullable=False,
        default=ActivityStatus.PENDING,
    )
    dosage_or_volume: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    logged_by_role: Mapped[str] = mapped_column(String(50), nullable=False, default="ADMIN")
    logged_by_name: Mapped[str] = mapped_column(String(100), nullable=False, default="Admin User")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    recommendation_adherence: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    crop_cycle = relationship("CropCycle", back_populates="activities")
    farmer = relationship("Farmer")
    field = relationship("Field")

    def __repr__(self) -> str:
        return f"<Activity id={self.id} type={self.activity_type} status={self.status}>"
