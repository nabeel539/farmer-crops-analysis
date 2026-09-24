def test_create_seed_supply_and_batch(client, admin_headers):
    vendor_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "Kaveri Seeds",
            "company_name": "Kaveri Seed Company Ltd",
            "contact_person": "G. Rao",
            "mobile_number": "9876543210",
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
            "variety": "PBW 550",
            "batch_number": "BATCH-WHT-2026-001",
            "quantity": 500.0,
            "unit": "KG",
            "supply_date": "2026-09-24",
            "purchase_reference": "PO-2026-099",
            "remarks": "Certified seeds",
        },
    )
    assert supply_resp.status_code == 201
    supply_data = supply_resp.json()
    assert supply_data["crop"] == "Wheat"
    assert supply_data["variety"] == "PBW 550"

    batches_resp = client.get("/api/v1/seeds/batches", headers=admin_headers)
    assert batches_resp.status_code == 200
    batches = batches_resp.json()
    assert len(batches) >= 1
    batch = next(b for b in batches if b["batch_number"] == "BATCH-WHT-2026-001")
    assert batch["available_quantity"] == 500.0
    assert batch["allocated_quantity"] == 0.0
