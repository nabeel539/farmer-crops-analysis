"""Pydantic schemas for Farmer CRUD operations."""

from datetime import datetime

from pydantic import BaseModel, Field


class FarmerCreate(BaseModel):
    """Schema for registering a new farmer."""

    name: str = Field(..., min_length=2, max_length=255)
    mobile_number: str = Field(..., min_length=10, max_length=20)
    address: str | None = None
    village: str = Field(..., min_length=1, max_length=100)
    block: str | None = Field(None, max_length=100)
    district: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default="ACTIVE", pattern="^(ACTIVE|INACTIVE|PENDING_VERIFICATION)$")
    registration_date: str | None = Field(None, max_length=20)


class FarmerUpdate(BaseModel):
    """Schema for partially updating a farmer."""

    name: str | None = Field(None, min_length=2, max_length=255)
    mobile_number: str | None = Field(None, min_length=10, max_length=20)
    address: str | None = None
    village: str | None = Field(None, min_length=1, max_length=100)
    block: str | None = Field(None, max_length=100)
    district: str | None = Field(None, min_length=1, max_length=100)
    state: str | None = Field(None, min_length=1, max_length=100)
    status: str | None = Field(None, pattern="^(ACTIVE|INACTIVE|PENDING_VERIFICATION)$")


class FarmerResponse(BaseModel):
    """Public farmer data."""

    id: str
    name: str
    mobile_number: str
    address: str | None = None
    village: str
    block: str | None = None
    district: str
    state: str
    status: str
    registration_date: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
