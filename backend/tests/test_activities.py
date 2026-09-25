"""Tests for Field Activities API."""

import pytest
from app.models.farmer import Farmer, FarmerStatus
from app.models.field import Field, FieldStatus, PolygonColor


@pytest.fixture
def test_activity_farmer(db_session):
    farmer = Farmer(
        name="Sukhwinder Singh",
        mobile_number="9876543201",
        village="Kotkapura",
        district="Faridkot",
        state="Punjab",
        status=FarmerStatus.ACTIVE,
        registration_date="2026-01-20",
    )
    db_session.add(farmer)
    db_session.commit()
    db_session.refresh(farmer)
    return farmer


def test_create_and_complete_activity(client, admin_headers, test_activity_farmer):
    farmer = test_activity_farmer
    payload = {
        "farmer_id": farmer.id,
        "activity_type": "FERTILIZER_UREA",
        "scheduled_date": "2026-02-01",
        "dosage_or_volume": "1 Bag (50kg) per Acre",
        "cost": 4500.0,
        "logged_by_role": "ADMIN",
        "logged_by_name": "Admin User",
        "notes": "First split nitrogen top dressing after first irrigation",
        "recommendation_adherence": True,
    }
    response = client.post("/api/v1/activities", json=payload, headers=admin_headers)
    assert response.status_code == 201
    act_data = response.json()
    assert act_data["status"] == "PENDING"
    assert act_data["cost"] == 4500.0

    act_id = act_data["id"]

    # Complete activity
    comp_payload = {
        "executed_date": "2026-02-02",
        "notes": "Applied successfully with optimum soil moisture",
        "recommendation_adherence": True,
    }
    comp_res = client.patch(f"/api/v1/activities/{act_id}/complete", json=comp_payload, headers=admin_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "COMPLETED"
    assert comp_res.json()["executed_date"] == "2026-02-02"


def test_list_activities_filter(client, admin_headers, test_activity_farmer):
    farmer = test_activity_farmer
    response = client.get(f"/api/v1/activities?farmer_id={farmer.id}", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
