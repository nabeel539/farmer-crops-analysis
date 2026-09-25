"""Field activity CRUD and completion execution API routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.dependencies.auth import get_current_user, require_admin_or_officer
from app.models.activity import Activity, ActivityStatus, ActivityType
from app.models.crop_cycle import CropCycle
from app.models.farmer import Farmer
from app.models.field import Field
from app.models.user import User
from app.schemas.activity import (
    ActivityComplete,
    ActivityCreate,
    ActivityResponse,
    ActivityUpdate,
)

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.post("", response_model=ActivityResponse, status_code=201)
def create_activity(
    data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Activity:
    """Schedule or log a new agronomic field operation."""
    # 1. Verify farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == data.farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    # 2. Verify field if provided
    if data.field_id:
        field = db.query(Field).filter(Field.id == data.field_id).first()
        if not field:
            raise NotFoundException("Field not found")

    # 3. Verify crop cycle if provided
    if data.crop_cycle_id:
        cycle = db.query(CropCycle).filter(CropCycle.id == data.crop_cycle_id).first()
        if not cycle:
            raise NotFoundException("Crop cycle not found")

    activity = Activity(
        crop_cycle_id=data.crop_cycle_id,
        farmer_id=data.farmer_id,
        field_id=data.field_id,
        activity_type=ActivityType(data.activity_type),
        scheduled_date=data.scheduled_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        status=ActivityStatus.PENDING,
        dosage_or_volume=data.dosage_or_volume,
        cost=data.cost,
        logged_by_role=data.logged_by_role or current_user.role.value,
        logged_by_name=data.logged_by_name or current_user.name,
        notes=data.notes,
        photo_url=data.photo_url,
        recommendation_adherence=data.recommendation_adherence,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("", response_model=list[ActivityResponse])
def list_activities(
    farmer_id: str | None = None,
    crop_cycle_id: str | None = None,
    field_id: str | None = None,
    activity_type: str | None = None,
    status: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Activity]:
    """List field operations with multi-criteria filtering and pagination."""
    query = db.query(Activity)

    if farmer_id:
        query = query.filter(Activity.farmer_id == farmer_id)
    if crop_cycle_id:
        query = query.filter(Activity.crop_cycle_id == crop_cycle_id)
    if field_id:
        query = query.filter(Activity.field_id == field_id)
    if activity_type and activity_type != "ALL":
        query = query.filter(Activity.activity_type == ActivityType(activity_type))
    if status and status != "ALL":
        query = query.filter(Activity.status == ActivityStatus(status))
    if search:
        query = query.filter(
            (Activity.dosage_or_volume.ilike(f"%{search}%"))
            | (Activity.notes.ilike(f"%{search}%"))
            | (Activity.logged_by_name.ilike(f"%{search}%"))
        )

    offset = (page - 1) * limit
    return query.order_by(Activity.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Activity:
    """Get single field activity details."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise NotFoundException("Activity not found")
    return activity


@router.patch("/{activity_id}/complete", response_model=ActivityResponse)
def complete_activity(
    activity_id: str,
    data: ActivityComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Activity:
    """Mark an activity as executed/completed with verification timestamp."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise NotFoundException("Activity not found")

    activity.status = ActivityStatus.COMPLETED
    activity.executed_date = data.executed_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if data.notes:
        activity.notes = data.notes
    if data.recommendation_adherence is not None:
        activity.recommendation_adherence = data.recommendation_adherence

    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: str,
    data: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Activity:
    """Partially update an activity."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise NotFoundException("Activity not found")

    update_data = data.model_dump(exclude_unset=True)
    if "activity_type" in update_data and update_data["activity_type"]:
        update_data["activity_type"] = ActivityType(update_data["activity_type"])
    if "status" in update_data and update_data["status"]:
        update_data["status"] = ActivityStatus(update_data["status"])

    for key, value in update_data.items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)
    return activity
