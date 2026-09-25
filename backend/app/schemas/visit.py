"""Pydantic schemas for Field Officer Visit operations."""

from datetime import datetime
from pydantic import BaseModel, Field


class VisitCreate(BaseModel):
    """Schema for filing a new field visit inspection log."""

    farmer_id: str
    field_id: str | None = None
    crop_cycle_id: str | None = None
    visit_date: str = Field(..., max_length=20)
    visit_type: str = Field(default="ROUTINE_SCOUTING", pattern="^(ROUTINE_SCOUTING|DISEASE_INSPECTION|INPUT_VERIFICATION|HARVEST_ESTIMATION|EMERGENCY_ASSESSMENT)$")
    observed_stage: str = Field(default="HEADING_FLOWERING", max_length=50)
    crop_condition: str = Field(default="HEALTHY", max_length=50)
    pest_observed: str | None = Field(None, max_length=255)
    verification_status: str = Field(default="VERIFIED_COMPLIANT", pattern="^(VERIFIED_COMPLIANT|ACTION_REQUIRED|FLAGGED_NON_COMPLIANT|PENDING_REVIEW)$")
    action_recommended: str | None = None
    farmer_signature_obtained: bool = True
    gps_lat: float | None = None
    gps_lng: float | None = None
    photo_url: str | None = Field(None, max_length=500)
    remarks: str | None = None


class VisitUpdate(BaseModel):
    """Schema for updating a field visit."""

    visit_type: str | None = None
    crop_condition: str | None = None
    pest_observed: str | None = None
    verification_status: str | None = None
    action_recommended: str | None = None
    farmer_signature_obtained: bool | None = None
    remarks: str | None = None


class VisitResponse(BaseModel):
    """Public visit inspection response."""

    id: str
    officer_id: str
    farmer_id: str
    field_id: str | None = None
    crop_cycle_id: str | None = None
    visit_date: str
    visit_type: str
    observed_stage: str
    crop_condition: str
    pest_observed: str | None = None
    verification_status: str
    action_recommended: str | None = None
    farmer_signature_obtained: bool
    gps_lat: float | None = None
    gps_lng: float | None = None
    photo_url: str | None = None
    remarks: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
