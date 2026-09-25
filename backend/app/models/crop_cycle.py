"""Crop cycle model — tracks crop lifecycle, variety, stages, and yield targets."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CropCycleStage(str, enum.Enum):
    """11-stage wheat phenology lifecycle."""
    LAND_PREPARATION = "LAND_PREPARATION"
    SOWING = "SOWING"
    CROWN_ROOT_INITIATION = "CROWN_ROOT_INITIATION"
    TILLERING = "TILLERING"
    JOINTING = "JOINTING"
    BOOTING = "BOOTING"
    HEADING_FLOWERING = "HEADING_FLOWERING"
    MILK_STAGE = "MILK_STAGE"
    DOUGH_STAGE = "DOUGH_STAGE"
    MATURITY_RIPENING = "MATURITY_RIPENING"
    HARVESTED = "HARVESTED"


class CropHealthStatus(str, enum.Enum):
    """Canopy and crop health condition."""
    OPTIMAL = "OPTIMAL"
    GOOD = "GOOD"
    STRESSED = "STRESSED"
    DISEASED = "DISEASED"
    CRITICAL = "CRITICAL"


class CropCycle(Base):
    """Crop cycle entity linking farmer and field with growth phenology."""

    __tablename__ = "crop_cycles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    cycle_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    farmer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    field_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("fields.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    crop_type: Mapped[str] = mapped_column(String(50), nullable=False, default="Wheat")
    variety: Mapped[str] = mapped_column(String(100), nullable=False, default="HD-2967")
    season: Mapped[str] = mapped_column(String(50), nullable=False, default="Rabi 2025-2026")
    sowing_date: Mapped[str] = mapped_column(String(20), nullable=False)
    sowing_method: Mapped[str] = mapped_column(String(50), nullable=False, default="DRILL_SOWING")
    allocated_acres: Mapped[float] = mapped_column(Float, nullable=False)
    stage: Mapped[CropCycleStage] = mapped_column(
        Enum(CropCycleStage, name="crop_cycle_stage_enum"),
        nullable=False,
        default=CropCycleStage.SOWING,
    )
    health_status: Mapped[CropHealthStatus] = mapped_column(
        Enum(CropHealthStatus, name="crop_health_status_enum"),
        nullable=False,
        default=CropHealthStatus.OPTIMAL,
    )
    expected_harvest_date: Mapped[str] = mapped_column(String(20), nullable=False)
    actual_harvest_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    expected_yield_maunds_per_acre: Mapped[float] = mapped_column(Float, nullable=False, default=52.0)
    target_total_yield_kg: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    actual_total_yield_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    ndvi_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.82)
    soil_moisture_pct: Mapped[float] = mapped_column(Float, nullable=False, default=45.0)
    temperature_celsius: Mapped[float] = mapped_column(Float, nullable=False, default=24.0)
    risk_alert_level: Mapped[str] = mapped_column(String(20), nullable=False, default="NONE")
    last_inspection_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    farmer = relationship("Farmer")
    field = relationship("Field")
    activities = relationship("Activity", back_populates="crop_cycle", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<CropCycle code={self.cycle_code} variety={self.variety} stage={self.stage}>"
