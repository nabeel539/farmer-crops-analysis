"""Pydantic schemas for Field Activity operations."""

from datetime import datetime
from pydantic import BaseModel, Field


class ActivityCreate(BaseModel):
    """Schema for scheduling a new agronomic field operation."""

    farmer_id: str
    field_id: str | None = None
    crop_cycle_id: str | None = None
    activity_type: str = Field(..., pattern="^(IRRIGATION|FERTILIZER_UREA|FERTILIZER_DAP|FERTILIZER_POTASH|PESTICIDE_SPRAY|WEEDICIDE_SPRAY|FIELD_VISIT_INSPECTION|SOIL_TEST|NDVI_ASSESSMENT)$")
    scheduled_date: str = Field(..., max_length=20)
    dosage_or_volume: str | None = Field(None, max_length=255)
    cost: float = Field(default=0.0, ge=0)
    logged_by_role: str = Field(default="ADMIN", max_length=50)
    logged_by_name: str = Field(default="Admin User", max_length=100)
    notes: str | None = None
    photo_url: str | None = Field(None, max_length=500)
    recommendation_adherence: bool = True


class ActivityComplete(BaseModel):
    """Schema for completing/executing an activity."""

    executed_date: str = Field(..., max_length=20)
    notes: str | None = None
    recommendation_adherence: bool | None = None


class ActivityUpdate(BaseModel):
    """Schema for editing an activity."""

    activity_type: str | None = None
    scheduled_date: str | None = None
    executed_date: str | None = None
    status: str | None = None
    dosage_or_volume: str | None = None
    cost: float | None = None
    notes: str | None = None
    recommendation_adherence: bool | None = None


class ActivityResponse(BaseModel):
    """Public activity data."""

    id: str
    crop_cycle_id: str | None = None
    farmer_id: str
    field_id: str | None = None
    activity_type: str
    scheduled_date: str
    executed_date: str | None = None
    status: str
    dosage_or_volume: str | None = None
    cost: float
    logged_by_role: str
    logged_by_name: str
    notes: str | None = None
    photo_url: str | None = None
    recommendation_adherence: bool
    created_at: datetime

    model_config = {"from_attributes": True}
