"""Field Officer Visit and ground truth verification API routes."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.dependencies.auth import get_current_user, require_admin_or_officer
from app.models.crop_cycle import CropCycle
from app.models.farmer import Farmer
from app.models.field import Field
from app.models.user import User
from app.models.visit import OfficerVisit, VerificationStatus, VisitType
from app.schemas.visit import VisitCreate, VisitResponse, VisitUpdate

router = APIRouter(prefix="/visits", tags=["Officer Visits"])


@router.post("", response_model=VisitResponse, status_code=201)
def create_visit(
    data: VisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> OfficerVisit:
    """Log an on-field scouting or verification visit."""
    # 1. Verify farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == data.farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    # 2. Verify field if specified
    if data.field_id:
        field = db.query(Field).filter(Field.id == data.field_id).first()
        if not field:
            raise NotFoundException("Field not found")

    # 3. Verify crop cycle if specified
    if data.crop_cycle_id:
        cycle = db.query(CropCycle).filter(CropCycle.id == data.crop_cycle_id).first()
        if not cycle:
            raise NotFoundException("Crop cycle not found")

    visit = OfficerVisit(
        officer_id=current_user.id,
        farmer_id=data.farmer_id,
        field_id=data.field_id,
        crop_cycle_id=data.crop_cycle_id,
        visit_date=data.visit_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        visit_type=VisitType(data.visit_type),
        observed_stage=data.observed_stage,
        crop_condition=data.crop_condition,
        pest_observed=data.pest_observed,
        verification_status=VerificationStatus(data.verification_status),
        action_recommended=data.action_recommended,
        farmer_signature_obtained=data.farmer_signature_obtained,
        gps_lat=data.gps_lat,
        gps_lng=data.gps_lng,
        photo_url=data.photo_url,
        remarks=data.remarks,
    )

    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


@router.get("", response_model=list[VisitResponse])
def list_visits(
    officer_id: str | None = None,
    farmer_id: str | None = None,
    visit_type: str | None = None,
    verification_status: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OfficerVisit]:
    """List officer field visits with optional filtering."""
    query = db.query(OfficerVisit)

    if officer_id:
        query = query.filter(OfficerVisit.officer_id == officer_id)
    if farmer_id:
        query = query.filter(OfficerVisit.farmer_id == farmer_id)
    if visit_type and visit_type != "ALL":
        query = query.filter(OfficerVisit.visit_type == VisitType(visit_type))
    if verification_status and verification_status != "ALL":
        query = query.filter(OfficerVisit.verification_status == VerificationStatus(verification_status))

    offset = (page - 1) * limit
    return query.order_by(OfficerVisit.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit(
    visit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OfficerVisit:
    """Get single officer visit details."""
    visit = db.query(OfficerVisit).filter(OfficerVisit.id == visit_id).first()
    if not visit:
        raise NotFoundException("Field visit record not found")
    return visit


@router.patch("/{visit_id}", response_model=VisitResponse)
def update_visit(
    visit_id: str,
    data: VisitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> OfficerVisit:
    """Update visit status or recommendations."""
    visit = db.query(OfficerVisit).filter(OfficerVisit.id == visit_id).first()
    if not visit:
        raise NotFoundException("Field visit record not found")

    update_data = data.model_dump(exclude_unset=True)
    if "visit_type" in update_data and update_data["visit_type"]:
        update_data["visit_type"] = VisitType(update_data["visit_type"])
    if "verification_status" in update_data and update_data["verification_status"]:
        update_data["verification_status"] = VerificationStatus(update_data["verification_status"])

    for key, value in update_data.items():
        setattr(visit, key, value)

    db.commit()
    db.refresh(visit)
    return visit
