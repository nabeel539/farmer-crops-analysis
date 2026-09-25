"""Pydantic schemas for Harvest Record operations."""

from datetime import datetime
from pydantic import BaseModel, Field


class HarvestCreate(BaseModel):
    """Schema for logging a new harvest intake."""

    farmer_id: str
    field_id: str | None = None
    crop_cycle_id: str | None = None
    harvest_date: str = Field(..., max_length=20)
    harvest_method: str = Field(default="MECHANICAL_HARVESTER", pattern="^(MANUAL_COMBINE|MECHANICAL_HARVESTER|REAPER)$")
    acreage_harvested: float = Field(..., gt=0)
    bags_collected: int = Field(default=0, ge=0)
    total_weight_maunds: float = Field(..., gt=0)
    grain_moisture_pct: float = Field(default=10.5, ge=0, le=100)
    grain_quality_grade: str = Field(default="GRADE_A_PREMIUM", pattern="^(GRADE_A_PREMIUM|GRADE_B_STANDARD|GRADE_C_FEED|REJECTED)$")
    dockage_percentage: float = Field(default=1.2, ge=0)
    procurement_center: str = Field(default="Khanna Silo Depot #4", max_length=100)
    officer_verified: bool = True
    status: str = Field(default="INSPECTED", pattern="^(PENDING_DELIVERY|DELIVERED_TO_MILL|INSPECTED|STORED_IN_SILO)$")
    remarks: str | None = None


class HarvestUpdate(BaseModel):
    """Schema for updating a harvest record."""

    bags_collected: int | None = None
    total_weight_maunds: float | None = None
    grain_moisture_pct: float | None = None
    grain_quality_grade: str | None = None
    dockage_percentage: float | None = None
    procurement_center: str | None = None
    officer_verified: bool | None = None
    status: str | None = None
    remarks: str | None = None


class HarvestResponse(BaseModel):
    """Public harvest record response."""

    id: str
    harvest_code: str
    farmer_id: str
    field_id: str | None = None
    crop_cycle_id: str | None = None
    harvest_date: str
    harvest_method: str
    acreage_harvested: float
    bags_collected: int
    total_weight_maunds: float
    total_weight_kg: float
    yield_per_acre_maunds: float
    grain_moisture_pct: float
    grain_quality_grade: str
    dockage_percentage: float
    procurement_center: str
    officer_verified: bool
    status: str
    remarks: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
