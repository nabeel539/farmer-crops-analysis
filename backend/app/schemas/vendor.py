"""Pydantic schemas for Vendor CRUD operations."""

from datetime import datetime

from pydantic import BaseModel, Field


class VendorCreate(BaseModel):
    """Schema for creating a new vendor."""

    vendor_name: str = Field(..., min_length=2, max_length=255)
    company_name: str = Field(..., min_length=2, max_length=255)
    contact_person: str = Field(..., min_length=2, max_length=255)
    mobile_number: str = Field(..., min_length=10, max_length=20)
    email: str | None = Field(None, max_length=255)
    address: str | None = None
    gstin: str | None = Field(None, max_length=20)
    status: str = Field(default="ACTIVE", pattern="^(ACTIVE|INACTIVE)$")


class VendorUpdate(BaseModel):
    """Schema for partially updating a vendor."""

    vendor_name: str | None = Field(None, min_length=2, max_length=255)
    company_name: str | None = Field(None, min_length=2, max_length=255)
    contact_person: str | None = Field(None, min_length=2, max_length=255)
    mobile_number: str | None = Field(None, min_length=10, max_length=20)
    email: str | None = Field(None, max_length=255)
    address: str | None = None
    gstin: str | None = Field(None, max_length=20)
    status: str | None = Field(None, pattern="^(ACTIVE|INACTIVE)$")


class VendorResponse(BaseModel):
    """Public vendor data."""

    id: str
    vendor_name: str
    company_name: str
    contact_person: str
    mobile_number: str
    email: str | None = None
    address: str | None = None
    gstin: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
