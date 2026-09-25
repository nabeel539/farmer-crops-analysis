"""Tests for Officer Visits & Ground Truth Verification API."""

import pytest
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field, FieldStatus, PolygonColor


@pytest.fixture
def test_visit_farmer_and_field(db_session):
    farmer = Farmer(
        name="Jaswant Singh",
        mobile_number="9876543202",
        village="Moga Rural",
        district="Moga",
        state="Punjab",
        status=FarmerStatus.ACTIVE,
        registration_date="2026-01-25",
    )
    db_session.add(farmer)
    db_session.commit()
    db_session.refresh(farmer)

    field = Field(
        farmer_id=farmer.id,
        field_name="South Wheat Acreage",
        area=15.0,
        status=FieldStatus.ACTIVE,
        polygon_color=PolygonColor.GREEN,
    )
    db_session.add(field)
    db_session.commit()
    db_session.refresh(field)

    return farmer, field


def test_log_officer_visit(client, officer_headers, test_visit_farmer_and_field):
    farmer, field = test_visit_farmer_and_field
    payload = {
        "farmer_id": farmer.id,
        "field_id": field.id,
        "visit_date": "2026-02-15",
        "visit_type": "ROUTINE_SCOUTING",
        "observed_stage": "TILLERING",
        "crop_condition": "HEALTHY",
        "verification_status": "VERIFIED_COMPLIANT",
        "action_recommended": "Maintain moisture; prepare for second nitrogen split",
        "farmer_signature_obtained": True,
    }
    response = client.post("/api/v1/visits", json=payload, headers=officer_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["verification_status"] == "VERIFIED_COMPLIANT"
    assert data["observed_stage"] == "TILLERING"


def test_list_and_update_visits(client, officer_headers, test_visit_farmer_and_field):
    farmer, field = test_visit_farmer_and_field
    payload = {
        "farmer_id": farmer.id,
        "field_id": field.id,
        "visit_date": "2026-02-18",
        "visit_type": "DISEASE_INSPECTION",
        "observed_stage": "HEADING_FLOWERING",
        "crop_condition": "PEST_ATTACK",
        "pest_observed": "Yellow Rust spot detected in north corner",
        "verification_status": "ACTION_REQUIRED",
        "action_recommended": "Spray Propiconazole 25% EC within 48 hours",
    }
    create_res = client.post("/api/v1/visits", json=payload, headers=officer_headers)
    visit_id = create_res.json()["id"]

    # List visits
    list_res = client.get(f"/api/v1/visits?farmer_id={farmer.id}", headers=officer_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Update visit status
    patch_res = client.patch(
        f"/api/v1/visits/{visit_id}",
        json={"verification_status": "VERIFIED_COMPLIANT", "remarks": "Farmer sprayed on schedule"},
        headers=officer_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["verification_status"] == "VERIFIED_COMPLIANT"
