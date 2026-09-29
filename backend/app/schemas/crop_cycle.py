"""Pydantic schemas for Crop Cycle operations."""

from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class CropCycleCreate(BaseModel):
    """Schema for initializing a new crop cycle."""

    farmer_id: str
    field_id: str
    crop_type: str = Field(default="Wheat", max_length=50)
    variety: str = Field(default="HD-2967", max_length=100)
    season: str = Field(default="Rabi 2025-2026", max_length=50)
    sowing_date: str = Field(..., max_length=50)
    sowing_method: str = Field(default="DRILL_SOWING", max_length=50)
    allocated_acres: float = Field(..., gt=0)
    expected_harvest_date: str = Field(..., max_length=50)
    expected_yield_maunds_per_acre: float = Field(default=52.0, gt=0)
    stage: str | None = None
    health_status: str | None = None
    soil_moisture_pct: float | None = None
    temperature_celsius: float | None = None
    ndvi_score: float | None = None
    remarks: str | None = None

    @field_validator("sowing_date", "expected_harvest_date", mode="before")
    @classmethod
    def format_date_strings(cls, v: str | None) -> str | None:
        if v and isinstance(v, str):
            return v.split("T")[0]
        return v


class CropCycleStageUpdate(BaseModel):
    """Schema for updating phenology stage and health condition."""

    stage: str = Field(..., pattern="^(LAND_PREPARATION|SOWING|CROWN_ROOT_INITIATION|TILLERING|JOINTING|BOOTING|HEADING_FLOWERING|MILK_STAGE|DOUGH_STAGE|MATURITY_RIPENING|HARVESTED)$")
    health_status: str = Field(default="OPTIMAL", pattern="^(OPTIMAL|GOOD|STRESSED|DISEASED|CRITICAL)$")
    ndvi_score: float | None = Field(default=None, ge=0.0, le=1.0)
    remarks: str | None = None


class CropCycleUpdate(BaseModel):
    """Schema for updating general crop cycle fields."""

    variety: str | None = None
    stage: str | None = None
    health_status: str | None = None
    expected_harvest_date: str | None = None
    actual_harvest_date: str | None = None
    expected_yield_maunds_per_acre: float | None = None
    ndvi_score: float | None = None
    soil_moisture_pct: float | None = None
    temperature_celsius: float | None = None
    risk_alert_level: str | None = None
    remarks: str | None = None

    @field_validator("expected_harvest_date", "actual_harvest_date", mode="before")
    @classmethod
    def format_date_strings(cls, v: str | None) -> str | None:
        if v and isinstance(v, str):
            return v.split("T")[0]
        return v


class CropCycleResponse(BaseModel):
    """Public crop cycle response with telemetry."""

    id: str
    cycle_code: str
    farmer_id: str
    field_id: str
    crop_type: str
    variety: str
    season: str
    sowing_date: str
    sowing_method: str
    allocated_acres: float
    stage: str
    health_status: str
    expected_harvest_date: str
    actual_harvest_date: str | None = None
    expected_yield_maunds_per_acre: float
    target_total_yield_kg: float
    actual_total_yield_kg: float | None = None
    ndvi_score: float
    soil_moisture_pct: float
    temperature_celsius: float
    risk_alert_level: str
    last_inspection_date: str | None = None
    remarks: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
