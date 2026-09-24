"""Pydantic schemas for Field CRUD operations."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


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
    status: str = Field(default="ACTIVE", pattern="^(ACTIVE|INACTIVE|HARVESTED)$")
    latitude: float | None = None
    longitude: float | None = None
    polygon: dict[str, Any] | None = None  # GeoJSON format
    polygon_color: str = Field(default="GREEN", pattern="^(GREEN|YELLOW|RED|BLUE)$")
    notes: str | None = None


class FieldUpdate(BaseModel):
    """Schema for partially updating a field."""

    field_name: str | None = Field(None, min_length=1, max_length=255)
    village: str | None = Field(None, max_length=100)
    block: str | None = Field(None, max_length=100)
    district: str | None = Field(None, max_length=100)
    area: float | None = Field(None, gt=0)
    crop: str | None = Field(None, max_length=100)
    season: str | None = Field(None, max_length=50)
    status: str | None = Field(None, pattern="^(ACTIVE|INACTIVE|HARVESTED)$")
    latitude: float | None = None
    longitude: float | None = None
    polygon: dict[str, Any] | None = None
    polygon_color: str | None = Field(None, pattern="^(GREEN|YELLOW|RED|BLUE)$")
    notes: str | None = None


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
