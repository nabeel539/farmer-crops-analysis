"""Tests for Crop Cycles API."""

import pytest
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field, FieldStatus, PolygonColor


@pytest.fixture
def test_farmer_and_field(db_session):
    farmer = Farmer(
        name="Harpreet Singh",
        mobile_number="9876543200",
        village="Rampur",
        district="Ludhiana",
        state="Punjab",
        status=FarmerStatus.ACTIVE,
        registration_date="2026-01-15",
    )
    db_session.add(farmer)
    db_session.commit()
    db_session.refresh(farmer)

    field = Field(
        farmer_id=farmer.id,
        field_name="North Wheat Plot",
        area=12.5,
        status=FieldStatus.ACTIVE,
        polygon_color=PolygonColor.GREEN,
    )
    db_session.add(field)
    db_session.commit()
    db_session.refresh(field)

    return farmer, field


def test_create_crop_cycle(client, admin_headers, test_farmer_and_field):
    farmer, field = test_farmer_and_field
    payload = {
        "farmer_id": farmer.id,
        "field_id": field.id,
        "crop_type": "Wheat",
        "variety": "HD-2967",
        "season": "Rabi 2025-2026",
        "sowing_date": "2025-11-10",
        "sowing_method": "DRILL_SOWING",
        "allocated_acres": 12.5,
        "expected_harvest_date": "2026-04-15",
        "expected_yield_maunds_per_acre": 54.0,
        "remarks": "Standard spacing and drill application",
    }
    response = client.post("/api/v1/crop-cycles", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["variety"] == "HD-2967"
    assert data["stage"] == "SOWING"
    assert data["target_total_yield_kg"] == 12.5 * 54.0 * 40.0


def test_advance_crop_stage(client, admin_headers, test_farmer_and_field):
    farmer, field = test_farmer_and_field
    payload = {
        "farmer_id": farmer.id,
        "field_id": field.id,
        "crop_type": "Wheat",
        "variety": "DBW-187",
        "season": "Rabi 2025-2026",
        "sowing_date": "2025-11-15",
        "sowing_method": "DRILL_SOWING",
        "allocated_acres": 10.0,
        "expected_harvest_date": "2026-04-20",
        "expected_yield_maunds_per_acre": 52.0,
    }
    create_res = client.post("/api/v1/crop-cycles", json=payload, headers=admin_headers)
    cycle_id = create_res.json()["id"]

    # Advance stage
    advance_payload = {
        "stage": "HEADING_FLOWERING",
        "health_status": "OPTIMAL",
        "ndvi_score": 0.88,
        "remarks": "Spike emergence uniform across parcel",
    }
    patch_res = client.patch(f"/api/v1/crop-cycles/{cycle_id}/stage", json=advance_payload, headers=admin_headers)
    assert patch_res.status_code == 200
    patch_data = patch_res.json()
    assert patch_data["stage"] == "HEADING_FLOWERING"
    assert patch_data["ndvi_score"] == 0.88


def test_list_crop_cycles_filter(client, admin_headers, test_farmer_and_field):
    farmer, field = test_farmer_and_field
    response = client.get(f"/api/v1/crop-cycles?farmer_id={farmer.id}", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
