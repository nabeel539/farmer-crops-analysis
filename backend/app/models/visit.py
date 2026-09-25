"""Field Officer visit and ground truth verification model."""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VisitType(str, enum.Enum):
    """Purpose and category of field visit."""
    ROUTINE_SCOUTING = "ROUTINE_SCOUTING"
    DISEASE_INSPECTION = "DISEASE_INSPECTION"
    INPUT_VERIFICATION = "INPUT_VERIFICATION"
    HARVEST_ESTIMATION = "HARVEST_ESTIMATION"
    EMERGENCY_ASSESSMENT = "EMERGENCY_ASSESSMENT"


class VerificationStatus(str, enum.Enum):
    """Agronomist verification outcome."""
    VERIFIED_COMPLIANT = "VERIFIED_COMPLIANT"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    FLAGGED_NON_COMPLIANT = "FLAGGED_NON_COMPLIANT"
    PENDING_REVIEW = "PENDING_REVIEW"


class OfficerVisit(Base):
    """On-field inspection log filed by Field Officer or Agri Manager."""

    __tablename__ = "officer_visits"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    officer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    farmer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("farmers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    field_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("fields.id", ondelete="SET NULL"), nullable=True, index=True
    )
    crop_cycle_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("crop_cycles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    visit_date: Mapped[str] = mapped_column(String(20), nullable=False)
    visit_type: Mapped[VisitType] = mapped_column(
        Enum(VisitType, name="visit_type_enum"),
        nullable=False,
        default=VisitType.ROUTINE_SCOUTING,
    )
    observed_stage: Mapped[str] = mapped_column(String(50), nullable=False, default="HEADING_FLOWERING")
    crop_condition: Mapped[str] = mapped_column(String(50), nullable=False, default="HEALTHY")
    pest_observed: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status_enum"),
        nullable=False,
        default=VerificationStatus.VERIFIED_COMPLIANT,
    )
    action_recommended: Mapped[str | None] = mapped_column(Text, nullable=True)
    farmer_signature_obtained: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    gps_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    gps_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    officer = relationship("User")
    farmer = relationship("Farmer")
    field = relationship("Field")
    crop_cycle = relationship("CropCycle")

    def __repr__(self) -> str:
        return f"<OfficerVisit id={self.id} officer={self.officer_id} status={self.verification_status}>"
