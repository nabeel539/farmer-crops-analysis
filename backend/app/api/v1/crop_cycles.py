"""Crop cycle CRUD and stage advancement API routes."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException, ValidationException
from app.dependencies.auth import get_current_user, require_admin_or_officer
from app.models.crop_cycle import CropCycle, CropCycleStage, CropHealthStatus
from app.models.farmer import Farmer
from app.models.field import Field
from app.models.user import User
from app.schemas.crop_cycle import (
    CropCycleCreate,
    CropCycleResponse,
    CropCycleStageUpdate,
    CropCycleUpdate,
)

router = APIRouter(prefix="/crop-cycles", tags=["Crop Cycles"])


@router.post("", response_model=CropCycleResponse, status_code=201)
def create_crop_cycle(
    data: CropCycleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> CropCycle:
    """Initialize a new crop cycle for a farmer and field parcel."""
    # 1. Verify farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == data.farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    # 2. Verify field exists
    field = db.query(Field).filter(Field.id == data.field_id).first()
    if not field:
        raise NotFoundException("Field not found")

    # Calculate target yield in KG (1 Maund = 40 KG)
    target_kg = round(data.allocated_acres * data.expected_yield_maunds_per_acre * 40.0, 2)

    # Generate cycle code
    count = db.query(CropCycle).count() + 1
    cycle_code = f"WHEAT-{datetime.now(timezone.utc).year}-{str(count).zfill(4)}"

    cycle = CropCycle(
        cycle_code=cycle_code,
        farmer_id=data.farmer_id,
        field_id=data.field_id,
        crop_type=data.crop_type,
        variety=data.variety,
        season=data.season,
        sowing_date=data.sowing_date,
        sowing_method=data.sowing_method,
        allocated_acres=data.allocated_acres,
        stage=CropCycleStage.SOWING,
        health_status=CropHealthStatus.OPTIMAL,
        expected_harvest_date=data.expected_harvest_date,
        expected_yield_maunds_per_acre=data.expected_yield_maunds_per_acre,
        target_total_yield_kg=target_kg,
        ndvi_score=0.82,
        soil_moisture_pct=45.0,
        temperature_celsius=24.0,
        risk_alert_level="NONE",
        remarks=data.remarks,
    )

    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("", response_model=list[CropCycleResponse])
def list_crop_cycles(
    farmer_id: str | None = None,
    field_id: str | None = None,
    stage: str | None = None,
    health_status: str | None = None,
    season: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CropCycle]:
    """List crop cycles with multi-criteria filtering and pagination."""
    query = db.query(CropCycle)

    if farmer_id:
        query = query.filter(CropCycle.farmer_id == farmer_id)
    if field_id:
        query = query.filter(CropCycle.field_id == field_id)
    if stage and stage != "ALL":
        query = query.filter(CropCycle.stage == CropCycleStage(stage))
    if health_status and health_status != "ALL":
        query = query.filter(CropCycle.health_status == CropHealthStatus(health_status))
    if season and season != "ALL":
        query = query.filter(CropCycle.season == season)
    if search:
        query = query.filter(
            (CropCycle.cycle_code.ilike(f"%{search}%"))
            | (CropCycle.variety.ilike(f"%{search}%"))
        )

    offset = (page - 1) * limit
    return query.order_by(CropCycle.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{cycle_id}", response_model=CropCycleResponse)
def get_crop_cycle(
    cycle_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CropCycle:
    """Get single crop cycle details by ID."""
    cycle = db.query(CropCycle).filter(CropCycle.id == cycle_id).first()
    if not cycle:
        raise NotFoundException("Crop cycle not found")
    return cycle


@router.patch("/{cycle_id}/stage", response_model=CropCycleResponse)
def advance_crop_stage(
    cycle_id: str,
    data: CropCycleStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> CropCycle:
    """Advance crop phenology stage and update health condition."""
    cycle = db.query(CropCycle).filter(CropCycle.id == cycle_id).first()
    if not cycle:
        raise NotFoundException("Crop cycle not found")

    cycle.stage = CropCycleStage(data.stage)
    cycle.health_status = CropHealthStatus(data.health_status)
    if data.ndvi_score is not None:
        cycle.ndvi_score = data.ndvi_score
    if data.remarks:
        cycle.remarks = data.remarks
    cycle.last_inspection_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    db.commit()
    db.refresh(cycle)
    return cycle


@router.patch("/{cycle_id}", response_model=CropCycleResponse)
def update_crop_cycle(
    cycle_id: str,
    data: CropCycleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> CropCycle:
    """Partially update crop cycle fields."""
    cycle = db.query(CropCycle).filter(CropCycle.id == cycle_id).first()
    if not cycle:
        raise NotFoundException("Crop cycle not found")

    update_data = data.model_dump(exclude_unset=True)
    if "stage" in update_data and update_data["stage"]:
        update_data["stage"] = CropCycleStage(update_data["stage"])
    if "health_status" in update_data and update_data["health_status"]:
        update_data["health_status"] = CropHealthStatus(update_data["health_status"])

    for key, value in update_data.items():
        setattr(cycle, key, value)

    db.commit()
    db.refresh(cycle)
    return cycle
