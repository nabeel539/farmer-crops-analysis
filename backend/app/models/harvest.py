"""Harvest record and grain intake quality model."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class HarvestMethod(str, enum.Enum):
    """Harvesting equipment or technique."""
    MANUAL_COMBINE = "MANUAL_COMBINE"
    MECHANICAL_HARVESTER = "MECHANICAL_HARVESTER"
    REAPER = "REAPER"


class GrainQualityGrade(str, enum.Enum):
    """Grading standard based on dockage, moisture, and grain lustre."""
    GRADE_A_PREMIUM = "GRADE_A_PREMIUM"
    GRADE_B_STANDARD = "GRADE_B_STANDARD"
    GRADE_C_FEED = "GRADE_C_FEED"
    REJECTED = "REJECTED"


class HarvestStatus(str, enum.Enum):
    """Intake and storage lifecycle."""
    PENDING_DELIVERY = "PENDING_DELIVERY"
    DELIVERED_TO_MILL = "DELIVERED_TO_MILL"
    INSPECTED = "INSPECTED"
    STORED_IN_SILO = "STORED_IN_SILO"


class HarvestRecord(Base):
    """Harvest yield, moisture analysis, and procurement intake record."""

    __tablename__ = "harvest_records"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    harvest_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    farmer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    field_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("fields.id", ondelete="SET NULL"), nullable=True, index=True
    )
    crop_cycle_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("crop_cycles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    harvest_date: Mapped[str] = mapped_column(String(20), nullable=False)
    harvest_method: Mapped[HarvestMethod] = mapped_column(
        Enum(HarvestMethod, name="harvest_method_enum"),
        nullable=False,
        default=HarvestMethod.MECHANICAL_HARVESTER,
    )
    acreage_harvested: Mapped[float] = mapped_column(Float, nullable=False)
    bags_collected: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_weight_maunds: Mapped[float] = mapped_column(Float, nullable=False)
    total_weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    yield_per_acre_maunds: Mapped[float] = mapped_column(Float, nullable=False)
    grain_moisture_pct: Mapped[float] = mapped_column(Float, nullable=False, default=10.5)
    grain_quality_grade: Mapped[GrainQualityGrade] = mapped_column(
        Enum(GrainQualityGrade, name="grain_quality_grade_enum"),
        nullable=False,
        default=GrainQualityGrade.GRADE_A_PREMIUM,
    )
    dockage_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=1.2)
    procurement_center: Mapped[str] = mapped_column(String(100), nullable=False, default="Khanna Silo Depot #4")
    officer_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    status: Mapped[HarvestStatus] = mapped_column(
        Enum(HarvestStatus, name="harvest_status_enum"),
        nullable=False,
        default=HarvestStatus.INSPECTED,
    )
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    farmer = relationship("Farmer")
    field = relationship("Field")
    crop_cycle = relationship("CropCycle")

    def __repr__(self) -> str:
        return f"<HarvestRecord code={self.harvest_code} farmer={self.farmer_id} yield={self.yield_per_acre_maunds} mnds/ac>"
