"""Tests for Harvest Records & Grain Intake API."""

import pytest
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field, FieldStatus, PolygonColor


@pytest.fixture
def test_harvest_farmer_and_field(db_session):
    farmer = Farmer(
        name="Gurdev Singh",
        mobile_number="9876543203",
        village="Samrala",
        district="Ludhiana",
        state="Punjab",
        status=FarmerStatus.ACTIVE,
        registration_date="2026-01-10",
    )
    db_session.add(farmer)
    db_session.commit()
    db_session.refresh(farmer)

    field = Field(
        farmer_id=farmer.id,
        field_name="East Field 1",
        area=10.0,
        status=FieldStatus.ACTIVE,
        polygon_color=PolygonColor.GREEN,
    )
    db_session.add(field)
    db_session.commit()
    db_session.refresh(field)

    return farmer, field


def test_create_harvest_record(client, admin_headers, test_harvest_farmer_and_field):
    farmer, field = test_harvest_farmer_and_field
    payload = {
        "farmer_id": farmer.id,
        "field_id": field.id,
        "harvest_date": "2026-04-12",
        "harvest_method": "MECHANICAL_HARVESTER",
        "acreage_harvested": 10.0,
        "bags_collected": 530,
        "total_weight_maunds": 530.0,
        "grain_moisture_pct": 10.8,
        "grain_quality_grade": "GRADE_A_PREMIUM",
        "dockage_percentage": 0.9,
        "procurement_center": "Khanna Silo Depot #4",
        "officer_verified": True,
        "status": "STORED_IN_SILO",
    }
    response = client.post("/api/v1/harvests", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["total_weight_kg"] == 530.0 * 40.0
    assert data["yield_per_acre_maunds"] == 53.0
    assert data["grain_quality_grade"] == "GRADE_A_PREMIUM"


def test_list_and_update_harvest(client, admin_headers, test_harvest_farmer_and_field):
    farmer, field = test_harvest_farmer_and_field
    payload = {
        "farmer_id": farmer.id,
        "field_id": field.id,
        "harvest_date": "2026-04-15",
        "harvest_method": "MANUAL_COMBINE",
        "acreage_harvested": 8.0,
        "bags_collected": 400,
        "total_weight_maunds": 400.0,
        "grain_moisture_pct": 11.2,
        "grain_quality_grade": "GRADE_B_STANDARD",
        "status": "PENDING_DELIVERY",
    }
    create_res = client.post("/api/v1/harvests", json=payload, headers=admin_headers)
    harvest_id = create_res.json()["id"]

    # List
    list_res = client.get(f"/api/v1/harvests?farmer_id={farmer.id}", headers=admin_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Update
    patch_res = client.patch(
        f"/api/v1/harvests/{harvest_id}",
        json={"status": "STORED_IN_SILO", "remarks": "Grain dried and transferred to Silo 2"},
        headers=admin_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "STORED_IN_SILO"
