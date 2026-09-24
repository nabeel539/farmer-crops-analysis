"""Pydantic schemas for Seed Supply, Seed Batch, and Seed Allocation."""

from datetime import datetime

from pydantic import BaseModel, Field


# --- Seed Supply ---

class SeedSupplyCreate(BaseModel):
    """Schema for recording a new seed supply from a vendor."""

    vendor_id: str
    crop: str = Field(..., min_length=1, max_length=100)
    variety: str = Field(..., min_length=1, max_length=100)
    batch_number: str = Field(..., min_length=1, max_length=50)
    quantity: float = Field(..., gt=0)
    unit: str = Field(default="KG", max_length=20)
    supply_date: str = Field(..., max_length=20)
    purchase_reference: str | None = Field(None, max_length=100)
    remarks: str | None = None


class SeedSupplyResponse(BaseModel):
    """Seed supply record response."""

    id: str
    vendor_id: str
    crop: str
    variety: str
    supply_date: str
    purchase_reference: str | None = None
    remarks: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Seed Batch ---

class SeedBatchResponse(BaseModel):
    """Seed batch / inventory record response."""

    id: str
    supply_id: str
    batch_number: str
    quantity: float
    unit: str
    received_quantity: float
    allocated_quantity: float
    available_quantity: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Seed Allocation ---

class SeedAllocationCreate(BaseModel):
    """Schema for allocating seed from a batch to a farmer's field."""

    seed_batch_id: str
    farmer_id: str
    field_id: str
    quantity: float = Field(..., gt=0)
    unit: str = Field(default="KG", max_length=20)
    allocation_date: str | None = Field(None, max_length=20)
    remarks: str | None = None


class SeedAllocationResponse(BaseModel):
    """Seed allocation record response."""

    id: str
    seed_batch_id: str
    farmer_id: str
    field_id: str
    quantity: float
    unit: str
    allocation_date: str
    allocated_by: str | None = None
    remarks: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
