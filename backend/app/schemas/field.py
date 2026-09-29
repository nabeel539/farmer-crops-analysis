"""Pydantic schemas for Field CRUD operations."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


def normalize_color(v: str | None) -> str | None:
    if v is None:
        return None
    val = str(v).strip()
    if not val:
        return "GREEN"
    val_upper = val.upper()
    if val_upper in ("GREEN", "YELLOW", "RED", "BLUE"):
        return val_upper
    
    # Map hex or other color names
    val_lower = val.lower()
    if any(h in val_lower for h in ("10b981", "22c55e", "16a34a", "green", "00ff00")):
        return "GREEN"
    if any(h in val_lower for h in ("f59e0b", "eab308", "ca8a04", "yellow", "amber")):
        return "YELLOW"
    if any(h in val_lower for h in ("ef4444", "dc2626", "b91c1c", "red", "rose")):
        return "RED"
    if any(h in val_lower for h in ("3b82f6", "2563eb", "1d4ed8", "blue", "cyan")):
        return "BLUE"
    return "GREEN"


class FieldCreate(BaseModel):
    """Schema for creating a new field for a farmer."""

    farmer_id: str
    field_name: str = Field(..., min_length=1, max_length=255)
    village: str | None = Field(None, max_length=100)
    block: str | None = Field(None, max_length=100)
    district: str | None = Field(None, max_length=100)
    area: float | None = Field(None, gt=0)
    crop: str | None = Field(None, max_length=100)
    season: str | None = Field(None, max_length=50)
    status: str = Field(default="PENDING_VERIFICATION", pattern="^(PENDING_VERIFICATION|ACTIVE|CORRECTION_REQUIRED|REJECTED|INACTIVE|HARVESTED)$")
    latitude: float | None = None
    longitude: float | None = None
    polygon: dict[str, Any] | None = None  # GeoJSON format
    polygon_color: str = Field(default="GREEN")
    notes: str | None = None

    @field_validator("polygon_color", mode="before")
    @classmethod
    def validate_color(cls, v: str | None) -> str:
        return normalize_color(v) or "GREEN"


class FieldUpdate(BaseModel):
    """Schema for partially updating a field."""

    field_name: str | None = Field(None, min_length=1, max_length=255)
    village: str | None = Field(None, max_length=100)
    block: str | None = Field(None, max_length=100)
    district: str | None = Field(None, max_length=100)
    area: float | None = Field(None, gt=0)
    crop: str | None = Field(None, max_length=100)
    season: str | None = Field(None, max_length=50)
    status: str | None = Field(None, pattern="^(PENDING_VERIFICATION|ACTIVE|CORRECTION_REQUIRED|REJECTED|INACTIVE|HARVESTED)$")
    latitude: float | None = None
    longitude: float | None = None
    polygon: dict[str, Any] | None = None
    polygon_color: str | None = Field(None)
    notes: str | None = None

    @field_validator("polygon_color", mode="before")
    @classmethod
    def validate_color(cls, v: str | None) -> str | None:
        return normalize_color(v)


class FieldResponse(BaseModel):
    """Public field data."""

    id: str
    farmer_id: str
    field_name: str
    village: str | None = None
    block: str | None = None
    district: str | None = None
    area: float | None = None
    crop: str | None = None
    season: str | None = None
    status: str
    latitude: float | None = None
    longitude: float | None = None
    polygon: dict[str, Any] | None = None
    polygon_color: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
