"""Harvest Record and grain intake quality API routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.dependencies.auth import get_current_user, require_admin_or_officer
from app.models.crop_cycle import CropCycle, CropCycleStage
from app.models.farmer import Farmer
from app.models.field import Field
from app.models.harvest import (
    GrainQualityGrade,
    HarvestMethod,
    HarvestRecord,
    HarvestStatus,
)
from app.models.user import User
from app.schemas.harvest import HarvestCreate, HarvestResponse, HarvestUpdate

router = APIRouter(prefix="/harvests", tags=["Harvest Records"])


@router.post("", response_model=HarvestResponse, status_code=201)
def create_harvest_record(
    data: HarvestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> HarvestRecord:
    """Log harvest intake with automatic weight in KG & yield per acre calculation."""
    # 1. Verify farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == data.farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    # 2. Verify field if specified
    if data.field_id:
        field = db.query(Field).filter(Field.id == data.field_id).first()
        if not field:
            raise NotFoundException("Field not found")

    # 3. Verify and update crop cycle if specified
    if data.crop_cycle_id:
        cycle = db.query(CropCycle).filter(CropCycle.id == data.crop_cycle_id).first()
        if cycle:
            cycle.stage = CropCycleStage.HARVESTED
            cycle.actual_harvest_date = data.harvest_date
            cycle.actual_total_yield_kg = data.total_weight_maunds * 40.0

    # Calculate metrics
    total_kg = round(data.total_weight_maunds * 40.0, 2)
    yield_per_acre = round(data.total_weight_maunds / data.acreage_harvested, 2) if data.acreage_harvested > 0 else 0.0

    count = db.query(HarvestRecord).count() + 1
    harvest_code = f"HRV-{datetime.now(timezone.utc).year}-{str(count).zfill(4)}"

    harvest = HarvestRecord(
        harvest_code=harvest_code,
        farmer_id=data.farmer_id,
        field_id=data.field_id,
        crop_cycle_id=data.crop_cycle_id,
        harvest_date=data.harvest_date,
        harvest_method=HarvestMethod(data.harvest_method),
        acreage_harvested=data.acreage_harvested,
        bags_collected=data.bags_collected,
        total_weight_maunds=data.total_weight_maunds,
        total_weight_kg=total_kg,
        yield_per_acre_maunds=yield_per_acre,
        grain_moisture_pct=data.grain_moisture_pct,
        grain_quality_grade=GrainQualityGrade(data.grain_quality_grade),
        dockage_percentage=data.dockage_percentage,
        procurement_center=data.procurement_center,
        officer_verified=data.officer_verified,
        status=HarvestStatus(data.status),
        remarks=data.remarks,
    )

    db.add(harvest)
    db.commit()
    db.refresh(harvest)
    return harvest


@router.get("", response_model=list[HarvestResponse])
def list_harvests(
    farmer_id: str | None = None,
    quality_grade: str | None = None,
    status: str | None = None,
    procurement_center: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[HarvestRecord]:
    """List harvest records with filters and pagination."""
    query = db.query(HarvestRecord)

    if farmer_id:
        query = query.filter(HarvestRecord.farmer_id == farmer_id)
    if quality_grade and quality_grade != "ALL":
        query = query.filter(HarvestRecord.grain_quality_grade == GrainQualityGrade(quality_grade))
    if status and status != "ALL":
        query = query.filter(HarvestRecord.status == HarvestStatus(status))
    if procurement_center:
        query = query.filter(HarvestRecord.procurement_center.ilike(f"%{procurement_center}%"))
    if search:
        query = query.filter(
            (HarvestRecord.harvest_code.ilike(f"%{search}%"))
            | (HarvestRecord.procurement_center.ilike(f"%{search}%"))
        )

    offset = (page - 1) * limit
    return query.order_by(HarvestRecord.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{harvest_id}", response_model=HarvestResponse)
def get_harvest(
    harvest_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HarvestRecord:
    """Get single harvest record details."""
    harvest = db.query(HarvestRecord).filter(HarvestRecord.id == harvest_id).first()
    if not harvest:
        raise NotFoundException("Harvest record not found")
    return harvest


@router.patch("/{harvest_id}", response_model=HarvestResponse)
def update_harvest(
    harvest_id: str,
    data: HarvestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> HarvestRecord:
    """Update harvest status, moisture, or quality grade."""
    harvest = db.query(HarvestRecord).filter(HarvestRecord.id == harvest_id).first()
    if not harvest:
        raise NotFoundException("Harvest record not found")

    update_data = data.model_dump(exclude_unset=True)
    if "grain_quality_grade" in update_data and update_data["grain_quality_grade"]:
        update_data["grain_quality_grade"] = GrainQualityGrade(update_data["grain_quality_grade"])
    if "status" in update_data and update_data["status"]:
        update_data["status"] = HarvestStatus(update_data["status"])

    for key, value in update_data.items():
        setattr(harvest, key, value)

    # Re-calculate weight KG and yield if weight changed
    if "total_weight_maunds" in update_data:
        harvest.total_weight_kg = round(harvest.total_weight_maunds * 40.0, 2)
        if harvest.acreage_harvested > 0:
            harvest.yield_per_acre_maunds = round(harvest.total_weight_maunds / harvest.acreage_harvested, 2)

    db.commit()
    db.refresh(harvest)
    return harvest
