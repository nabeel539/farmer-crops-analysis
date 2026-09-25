"""Field CRUD API routes with polygon and color management."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import BadRequestException, NotFoundException
from app.dependencies.auth import require_admin_or_officer
from app.models.farmer import Farmer
from app.models.field import Field, FieldStatus, PolygonColor
from app.models.user import User
from app.schemas.field import FieldCreate, FieldResponse, FieldUpdate

router = APIRouter(prefix="/fields", tags=["Fields"])


@router.post("", response_model=FieldResponse, status_code=201)
def create_field(
    data: FieldCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Field:
    """Create a new field for a farmer. Admin or Field Officer only."""
    # Validate farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == data.farmer_id).first()
    if not farmer:
        raise NotFoundException("Farmer not found")

    # Validate polygon structure if provided
    if data.polygon:
        _validate_polygon(data.polygon)

    field = Field(
        farmer_id=data.farmer_id,
        field_name=data.field_name,
        village=data.village,
        block=data.block,
        district=data.district,
        area=data.area,
        crop=data.crop,
        season=data.season,
        status=FieldStatus(data.status),
        latitude=data.latitude,
        longitude=data.longitude,
        polygon=data.polygon,
        polygon_color=PolygonColor(data.polygon_color),
        notes=data.notes,
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


@router.get("", response_model=list[FieldResponse])
def list_fields(
    farmer_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> list[Field]:
    """List fields. Optionally filter by farmer or status. Admin or Field Officer only."""
    query = db.query(Field)
    if farmer_id:
        query = query.filter(Field.farmer_id == farmer_id)
    if status:
        query = query.filter(Field.status == FieldStatus(status))
    return query.order_by(Field.created_at.desc()).all()


@router.get("/{field_id}", response_model=FieldResponse)
def get_field(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Field:
    """Get a specific field by ID. Admin or Field Officer only."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise NotFoundException("Field not found")
    return field


@router.patch("/{field_id}", response_model=FieldResponse)
def update_field(
    field_id: str,
    data: FieldUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Field:
    """Partially update a field (including polygon and color). Admin or Field Officer only."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise NotFoundException("Field not found")

    update_data = data.model_dump(exclude_unset=True)

    # Validate polygon if being updated
    if "polygon" in update_data and update_data["polygon"]:
        _validate_polygon(update_data["polygon"])

    # Convert enum strings to enum values
    if "status" in update_data and update_data["status"]:
        update_data["status"] = FieldStatus(update_data["status"])
    if "polygon_color" in update_data and update_data["polygon_color"]:
        update_data["polygon_color"] = PolygonColor(update_data["polygon_color"])

    for key, value in update_data.items():
        setattr(field, key, value)

    db.commit()
    db.refresh(field)
    return field


@router.delete("/{field_id}", status_code=204)
def delete_field(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> None:
    """Delete a field parcel record completely. Admin or Field Officer only."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise NotFoundException("Field not found")

    db.delete(field)
    db.commit()
    return None


@router.delete("/{field_id}/polygon", response_model=FieldResponse)
def delete_polygon(
    field_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_officer),
) -> Field:
    """Remove the polygon from a field. Admin or Field Officer only."""
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise NotFoundException("Field not found")

    field.polygon = None
    db.commit()
    db.refresh(field)
    return field


def _validate_polygon(polygon: dict) -> None:
    """Validate that polygon data follows a GeoJSON-compatible structure."""
    if "type" not in polygon:
        raise BadRequestException("Polygon must have a 'type' field")
    if polygon["type"] != "Polygon":
        raise BadRequestException("Polygon type must be 'Polygon'")
    if "coordinates" not in polygon:
        raise BadRequestException("Polygon must have 'coordinates' field")
    coords = polygon["coordinates"]
    if not isinstance(coords, list) or len(coords) == 0:
        raise BadRequestException("Polygon coordinates must be a non-empty array")
    ring = coords[0]
    if not isinstance(ring, list) or len(ring) < 4:
        raise BadRequestException("Polygon ring must have at least 4 coordinate pairs (closed ring)")
