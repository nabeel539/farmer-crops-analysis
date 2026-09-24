def test_seed_allocation_flow(client, admin_headers):
    # 1. Create vendor
    vendor_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "Punjab Seeds Corp",
            "company_name": "Punjab State Seeds Corp",
            "contact_person": "J. Singh",
            "mobile_number": "9876540020",
        },
    )
    assert vendor_resp.status_code == 201
    vendor_id = vendor_resp.json()["id"]

    # 2. Create seed supply & batch (100 KG)
    client.post(
        "/api/v1/seeds/supplies",
        headers=admin_headers,
        json={
            "vendor_id": vendor_id,
            "crop": "Paddy",
            "variety": "PR 126",
            "batch_number": "BATCH-PDY-001",
            "quantity": 100.0,
            "unit": "KG",
            "supply_date": "2026-09-24",
        },
    )
    batches_resp = client.get("/api/v1/seeds/batches", headers=admin_headers)
    batch = next(b for b in batches_resp.json() if b["batch_number"] == "BATCH-PDY-001")
    batch_id = batch["id"]

    # 3. Create farmer
    farmer_resp = client.post(
        "/api/v1/farmers",
        headers=admin_headers,
        json={
            "name": "Jagtar Singh",
            "mobile_number": "9876540021",
            "village": "Moga",
            "district": "Moga",
            "state": "Punjab",
        },
    )
    farmer_id = farmer_resp.json()["id"]

    # 4. Create field
    field_resp = client.post(
        "/api/v1/fields",
        headers=admin_headers,
        json={"farmer_id": farmer_id, "field_name": "Paddy Field 1", "area": 5.0, "crop": "Paddy"},
    )
    field_id = field_resp.json()["id"]

    # 5. Allocate 30 KG to the farmer/field
    alloc_resp = client.post(
        "/api/v1/seed-allocations",
        headers=admin_headers,
        json={
            "seed_batch_id": batch_id,
            "farmer_id": farmer_id,
            "field_id": field_id,
            "quantity": 30.0,
            "unit": "KG",
        },
    )
    assert alloc_resp.status_code == 201
    alloc_data = alloc_resp.json()
    assert alloc_data["quantity"] == 30.0

    # 6. Verify batch stock was updated (100 - 30 = 70 available, 30 allocated)
    batches_updated = client.get("/api/v1/seeds/batches", headers=admin_headers).json()
    updated_batch = next(b for b in batches_updated if b["id"] == batch_id)
    assert updated_batch["available_quantity"] == 70.0
    assert updated_batch["allocated_quantity"] == 30.0

    # 7. Try over-allocation (request 80 KG when only 70 KG is available) -> should fail 400
    fail_resp = client.post(
        "/api/v1/seed-allocations",
        headers=admin_headers,
        json={
            "seed_batch_id": batch_id,
            "farmer_id": farmer_id,
            "field_id": field_id,
            "quantity": 80.0,
            "unit": "KG",
        },
    )
    assert fail_resp.status_code == 400
    assert "Insufficient inventory" in fail_resp.json()["detail"]


def test_seed_allocation_invalid_field_owner(client, admin_headers):
    # Create vendor and batch
    vendor_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={"vendor_name": "VndCorp", "company_name": "Vnd Ltd", "contact_person": "Vikram Singh", "mobile_number": "9876540030"},
    )
    assert vendor_resp.status_code == 201
    vendor = vendor_resp.json()

    supply_resp = client.post(
        "/api/v1/seeds/supplies",
        headers=admin_headers,
        json={"vendor_id": vendor["id"], "crop": "Wheat", "variety": "HD-2967", "quantity": 50.0, "unit": "KG", "batch_number": "BATCH-W-99", "supply_date": "2026-09-24"},
    )
    assert supply_resp.status_code == 201

    batch = next(b for b in client.get("/api/v1/seeds/batches", headers=admin_headers).json() if b["batch_number"] == "BATCH-W-99")

    # Farmer A
    f_a = client.post("/api/v1/farmers", headers=admin_headers, json={"name": "Farmer A", "mobile_number": "9876540031", "village": "V1", "district": "D1", "state": "S1"}).json()
    # Farmer B
    f_b = client.post("/api/v1/farmers", headers=admin_headers, json={"name": "Farmer B", "mobile_number": "9876540032", "village": "V2", "district": "D2", "state": "S2"}).json()
    # Field belongs to Farmer A
    field_a = client.post("/api/v1/fields", headers=admin_headers, json={"farmer_id": f_a["id"], "field_name": "Field A", "area": 2.0}).json()

    # Try allocating to Farmer B with Field A -> Should fail 400
    bad_resp = client.post(
        "/api/v1/seed-allocations",
        headers=admin_headers,
        json={
            "seed_batch_id": batch["id"],
            "farmer_id": f_b["id"],
            "field_id": field_a["id"],
            "quantity": 10.0,
            "unit": "KG",
        },
    )
    assert bad_resp.status_code == 400
    assert "does not belong to the specified farmer" in bad_resp.json()["detail"]
