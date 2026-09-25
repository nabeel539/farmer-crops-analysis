"""Models package — exports all models for Alembic auto-detection."""

from app.models.user import User, UserRole
from app.models.vendor import Vendor, VendorStatus
from app.models.seed import SeedSupply, SeedBatch
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field, FieldStatus, PolygonColor
from app.models.allocation import SeedAllocation
from app.models.crop_cycle import CropCycle, CropCycleStage, CropHealthStatus
from app.models.activity import Activity, ActivityType, ActivityStatus
from app.models.visit import OfficerVisit, VisitType, VerificationStatus
from app.models.harvest import (
    HarvestRecord,
    HarvestMethod,
    GrainQualityGrade,
    HarvestStatus,
)

__all__ = [
    "User",
    "UserRole",
    "Vendor",
    "VendorStatus",
    "SeedSupply",
    "SeedBatch",
    "Farmer",
    "FarmerStatus",
    "Field",
    "FieldStatus",
    "PolygonColor",
    "SeedAllocation",
    "CropCycle",
    "CropCycleStage",
    "CropHealthStatus",
    "Activity",
    "ActivityType",
    "ActivityStatus",
    "OfficerVisit",
    "VisitType",
    "VerificationStatus",
    "HarvestRecord",
    "HarvestMethod",
    "GrainQualityGrade",
    "HarvestStatus",
]
