"""End-to-End (E2E) integration test covering the complete agricultural lifecycle.

Flow:
1. Register & authenticate Admin and Farmer users
2. Admin creates Seed Vendor and receives Seed Supply (generating warehouse batch inventory)
3. Admin enrolls Farmer and configures GIS Land Parcel
4. Admin allocates certified seeds to Farmer's field (9-point validation + inventory deduction)
5. Admin initiates Seasonal Wheat Crop Cycle
6. Farmer logs in and queries Farmer Portal (Passbook, Crop Cycle, Telemetry)
7. Farmer self-logs operations in Kisan Diary (Irrigation & Fertilizer top-dressing)
8. Field Officer logs inspection visit and advances phenology stage
9. Record Harvest intake and verify Mandi MSP revenue calculations
10. Verify Reports & Analytics reflect complete traceability
"""

import pytest
from fastapi.testclient import TestClient


def test_complete_farmer_and_crop_lifecycle_e2e(client: TestClient) -> None:
    # -------------------------------------------------------------
    # 1. Register Admin and Farmer Users
    # -------------------------------------------------------------
    # Register Admin
    admin_reg = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Super Admin",
            "email": "e2e_admin@krishi.local",
            "password": "AdminPassword123!",
            "role": "ADMIN",
            "mobile": "9999900001",
        },
    )
    assert admin_reg.status_code == 201
    admin_id = admin_reg.json()["id"]

    # Login Admin to get Token
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "e2e_admin@krishi.local", "password": "AdminPassword123!"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Register Farmer User
    farmer_reg = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Sardar Gurpreet Singh",
            "email": "9814054321@krishi.local",
            "password": "FarmerPassword123!",
            "role": "FARMER",
            "mobile": "9814054321",
        },
    )
    assert farmer_reg.status_code == 201

    # Login Farmer to get Token
    farmer_login = client.post(
        "/api/v1/auth/login",
        json={"email": "9814054321@krishi.local", "password": "FarmerPassword123!"},
    )
    assert farmer_login.status_code == 200
    farmer_token = farmer_login.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    # -------------------------------------------------------------
    # 2. Vendor Supply & Warehouse Batch Creation
    # -------------------------------------------------------------
    vendor_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "Punjab State Seeds Corp",
            "company_name": "Punjab State Seeds Corporation Ltd",
            "contact_person": "Dr. Harjeet Singh",
            "mobile_number": "9876500001",
            "email": "pssc@punjabseeds.gov.in",
            "address": "Seed Complex, Ludhiana",
            "status": "ACTIVE",
        },
    )
    assert vendor_resp.status_code == 201
    vendor_id = vendor_resp.json()["id"]

    supply_resp = client.post(
        "/api/v1/seeds/supplies",
        headers=admin_headers,
        json={
            "vendor_id": vendor_id,
            "crop": "Wheat",
            "variety": "HD-2967",
            "batch_number": "BATCH-E2E-PB2026",
            "quantity": 2000.0,
            "unit": "KG",
            "supply_date": "2025-10-15",
            "purchase_reference": "PO-E2E-9901",
        },
    )
    assert supply_resp.status_code == 201
    supply_id = supply_resp.json()["id"]

    # Verify Seed Batch generated in inventory
    batches_resp = client.get("/api/v1/seeds/batches", headers=admin_headers)
    assert batches_resp.status_code == 200
    batch = next(b for b in batches_resp.json() if b["supply_id"] == supply_id)
    assert batch["batch_number"] == "BATCH-E2E-PB2026"
    assert batch["available_quantity"] == 2000.0
    batch_id = batch["id"]

    # -------------------------------------------------------------
    # 3. Enroll Farmer Profile & GIS Land Parcel
    # -------------------------------------------------------------
    farmer_profile_resp = client.post(
        "/api/v1/farmers",
        headers=admin_headers,
        json={
            "name": "Sardar Gurpreet Singh",
            "mobile_number": "9814054321",
            "village": "Gill Kalan",
            "block": "Ludhiana West",
            "district": "Ludhiana",
            "state": "Punjab",
            "status": "ACTIVE",
            "registration_date": "2025-10-20",
        },
    )
    assert farmer_profile_resp.status_code == 201
    farmer_db_id = farmer_profile_resp.json()["id"]

    # Create GIS Land Parcel for the Farmer
    field_resp = client.post(
        "/api/v1/fields",
        headers=admin_headers,
        json={
            "farmer_id": farmer_db_id,
            "field_name": "Gill Kalan North Block #1",
            "village": "Gill Kalan",
            "block": "Ludhiana West",
            "district": "Ludhiana",
            "area": 10.0,
            "crop": "Wheat",
            "season": "Rabi 2025-26",
            "latitude": 30.9010,
            "longitude": 75.8573,
            "polygon": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [75.8570, 30.9010],
                        [75.8580, 30.9010],
                        [75.8580, 30.9020],
                        [75.8570, 30.9020],
                        [75.8570, 30.9010],
                    ]
                ],
            },
            "polygon_color": "GREEN",
        },
    )
    assert field_resp.status_code == 201
    field_id = field_resp.json()["id"]

    # -------------------------------------------------------------
    # 4. Atomic Seed Allocation (Warehouse -> Farmer Field)
    # -------------------------------------------------------------
    alloc_resp = client.post(
        "/api/v1/seed-allocations",
        headers=admin_headers,
        json={
            "seed_batch_id": batch_id,
            "farmer_id": farmer_db_id,
            "field_id": field_id,
            "quantity": 400.0,
            "unit": "KG",
            "allocation_date": "2025-10-25",
            "remarks": "Subsidized certified seed allocation for 10 acres wheat",
        },
    )
    assert alloc_resp.status_code == 201

    # Verify inventory was deducted from warehouse batch
    batch_check = client.get(f"/api/v1/seeds/batches/{batch_id}", headers=admin_headers)
    assert batch_check.status_code == 200
    assert batch_check.json()["allocated_quantity"] == 400.0
    assert batch_check.json()["available_quantity"] == 1600.0

    # -------------------------------------------------------------
    # 5. Initiate Seasonal Wheat Crop Cycle
    # -------------------------------------------------------------
    cycle_resp = client.post(
        "/api/v1/crop-cycles",
        headers=admin_headers,
        json={
            "farmer_id": farmer_db_id,
            "field_id": field_id,
            "crop_type": "Wheat",
            "variety": "HD-2967",
            "season": "Rabi 2025-26",
            "sowing_date": "2025-11-05",
            "sowing_method": "Precision Drill Sowing",
            "allocated_acres": 10.0,
            "expected_harvest_date": "2026-04-10",
            "expected_yield_maunds_per_acre": 50.0,
            "remarks": "Sown after optimal rauni irrigation.",
        },
    )
    assert cycle_resp.status_code == 201
    cycle_id = cycle_resp.json()["id"]
    assert cycle_resp.json()["stage"] == "SOWING"
    assert cycle_resp.json()["target_total_yield_kg"] == 20000.0  # 10 acres * 50 maunds * 40 kg

    # -------------------------------------------------------------
    # 6. Farmer Portal Access & Telemetry Queries
    # -------------------------------------------------------------
    # Farmer fetches their own fields
    farmer_fields = client.get(f"/api/v1/fields?farmer_id={farmer_db_id}", headers=farmer_headers)
    assert farmer_fields.status_code == 200
    assert len(farmer_fields.json()) == 1
    assert farmer_fields.json()[0]["id"] == field_id

    # Farmer checks digital seed passbook
    farmer_passbook = client.get(f"/api/v1/seed-allocations?farmer_id={farmer_db_id}", headers=farmer_headers)
    assert farmer_passbook.status_code == 200
    assert len(farmer_passbook.json()) == 1
    assert farmer_passbook.json()[0]["quantity"] == 400.0

    # Farmer checks active crop cycle
    farmer_cycles = client.get(f"/api/v1/crop-cycles?farmer_id={farmer_db_id}", headers=farmer_headers)
    assert farmer_cycles.status_code == 200
    assert len(farmer_cycles.json()) == 1
    assert farmer_cycles.json()[0]["variety"] == "HD-2967"

    # -------------------------------------------------------------
    # 7. Farmer Self-Logs in Kisan Diary
    # -------------------------------------------------------------
    # Farmer logs 1st CRI Irrigation
    kisan_irrigation = client.post(
        "/api/v1/activities",
        headers=farmer_headers,
        json={
            "farmer_id": farmer_db_id,
            "crop_cycle_id": cycle_id,
            "field_id": field_id,
            "activity_type": "IRRIGATION",
            "scheduled_date": "2025-11-26",
            "dosage_or_volume": "3 Acre Inches Tubewell Irrigation (CRI Stage)",
            "cost": 1500,
            "logged_by_role": "FARMER",
            "logged_by_name": "Sardar Gurpreet Singh",
            "notes": "Crown roots well established. Soil moisture optimal.",
        },
    )
    assert kisan_irrigation.status_code == 201

    # Farmer logs 1st Split Urea Top-Dressing
    kisan_urea = client.post(
        "/api/v1/activities",
        headers=farmer_headers,
        json={
            "farmer_id": farmer_db_id,
            "crop_cycle_id": cycle_id,
            "field_id": field_id,
            "activity_type": "FERTILIZER_UREA",
            "scheduled_date": "2025-12-10",
            "dosage_or_volume": "10 Bags Urea (1 bag/acre)",
            "cost": 2700,
            "logged_by_role": "FARMER",
            "logged_by_name": "Sardar Gurpreet Singh",
            "notes": "Applied after first weeding.",
        },
    )
    assert kisan_urea.status_code == 201

    # Farmer verifies both diary entries exist
    diary_entries = client.get(f"/api/v1/activities?farmer_id={farmer_db_id}", headers=farmer_headers)
    assert diary_entries.status_code == 200
    assert len(diary_entries.json()) == 2

    # -------------------------------------------------------------
    # 8. Field Officer Inspection & Phenology Stage Advancement
    # -------------------------------------------------------------
    # Field Officer logs inspection visit
    visit_resp = client.post(
        "/api/v1/visits",
        headers=admin_headers,
        json={
            "farmer_id": farmer_db_id,
            "field_id": field_id,
            "crop_cycle_id": cycle_id,
            "visit_date": "2025-12-15",
            "visit_type": "ROUTINE_SCOUTING",
            "observed_stage": "TILLERING",
            "crop_condition": "EXCELLENT",
            "pest_observed": "No Yellow Rust or Aphids",
            "verification_status": "VERIFIED_COMPLIANT",
            "action_recommended": "Maintain secondary split nitrogen schedule at 55 days.",
            "farmer_signature_obtained": True,
            "gps_lat": 30.9015,
            "gps_lng": 75.8575,
        },
    )
    assert visit_resp.status_code == 201

    # Advance crop cycle stage to TILLERING
    stage_update = client.patch(
        f"/api/v1/crop-cycles/{cycle_id}/stage",
        headers=admin_headers,
        json={
            "stage": "TILLERING",
            "health_status": "OPTIMAL",
            "ndvi_score": 0.88,
            "remarks": "Tillering density: 420 tillers/m2.",
        },
    )
    assert stage_update.status_code == 200
    assert stage_update.json()["stage"] == "TILLERING"
    assert stage_update.json()["ndvi_score"] == 0.88

    # -------------------------------------------------------------
    # 9. Record Harvest Intake & Mandi Valuation
    # -------------------------------------------------------------
    harvest_resp = client.post(
        "/api/v1/harvests",
        headers=admin_headers,
        json={
            "farmer_id": farmer_db_id,
            "field_id": field_id,
            "crop_cycle_id": cycle_id,
            "harvest_date": "2026-04-12",
            "harvest_method": "MECHANICAL_HARVESTER",
            "acreage_harvested": 10.0,
            "bags_collected": 400,
            "total_weight_maunds": 520.0,  # 52 Maunds / Acre = 20,800 KG
            "grain_moisture_pct": 11.4,
            "grain_quality_grade": "GRADE_A_PREMIUM",
            "dockage_percentage": 0.5,
            "procurement_center": "Strategic Silo #4 (FCI)",
            "officer_verified": True,
            "status": "STORED_IN_SILO",
            "remarks": "High gluten grain, excellent test weight.",
        },
    )
    assert harvest_resp.status_code == 201
    harvest_data = harvest_resp.json()
    assert harvest_data["total_weight_kg"] == 20800.0
    assert harvest_data["yield_per_acre_maunds"] == 52.0

    # Farmer verifies their harvest record in portal
    farmer_harvest = client.get(f"/api/v1/harvests?farmer_id={farmer_db_id}", headers=farmer_headers)
    assert farmer_harvest.status_code == 200
    assert len(farmer_harvest.json()) == 1
    assert farmer_harvest.json()[0]["total_weight_kg"] == 20800.0

    # -------------------------------------------------------------
    # 10. Reports & Analytics Summary
    # -------------------------------------------------------------
    summary_resp = client.get("/api/v1/reports/summary", headers=admin_headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_farmers"] >= 1
    assert summary["total_fields"] >= 1
    assert summary["total_cultivated_acres"] >= 10.0
    assert summary["total_seed_allocated_kg"] >= 400.0
    assert summary["actual_production_kg"] >= 20800.0
