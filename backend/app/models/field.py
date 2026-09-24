"""Field model with polygon support for agricultural plot mapping."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FieldStatus(str, enum.Enum):
    """Field operational status."""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    HARVESTED = "HARVESTED"


class PolygonColor(str, enum.Enum):
    """Field polygon color indicating health/status on the map."""

    GREEN = "GREEN"      # Healthy / Active
    YELLOW = "YELLOW"    # Monitoring Required
    RED = "RED"          # Problem / Attention Required
    BLUE = "BLUE"        # Harvested / Completed


class Field(Base):
    """Agricultural field/plot belonging to a farmer. Supports GeoJSON polygon."""

    __tablename__ = "fields"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    farmer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    field_name: Mapped[str] = mapped_column(String(255), nullable=False)
    village: Mapped[str | None] = mapped_column(String(100), nullable=True)
    block: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    area: Mapped[float | None] = mapped_column(Float, nullable=True)  # in acres
    crop: Mapped[str | None] = mapped_column(String(100), nullable=True)
    season: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[FieldStatus] = mapped_column(
        Enum(FieldStatus, name="field_status_enum"), nullable=False, default=FieldStatus.ACTIVE
    )
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # GeoJSON-compatible polygon stored as JSONB
    # Format: {"type": "Polygon", "coordinates": [[[lng, lat], ...]]}
    polygon: Mapped[dict | None] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"), nullable=True
    )
    polygon_color: Mapped[PolygonColor] = mapped_column(
        Enum(PolygonColor, name="polygon_color_enum"), nullable=False, default=PolygonColor.GREEN
    )

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
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
    farmer = relationship("Farmer", back_populates="fields")
    allocations = relationship("SeedAllocation", back_populates="field", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Field {self.field_name} farmer={self.farmer_id}>"
