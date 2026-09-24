def test_create_and_get_farmer(client, officer_headers):
    resp = client.post(
        "/api/v1/farmers",
        headers=officer_headers,
        json={
            "name": "Balwinder Singh",
            "mobile_number": "9876540001",
            "village": "Rampur",
            "block": "Samrala",
            "district": "Ludhiana",
            "state": "Punjab",
            "address": "House 12, Main Street",
            "status": "ACTIVE",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Balwinder Singh"
    assert data["status"] == "ACTIVE"
    farmer_id = data["id"]

    get_resp = client.get(f"/api/v1/farmers/{farmer_id}", headers=officer_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Balwinder Singh"


def test_search_and_paginate_farmers(client, officer_headers):
    client.post(
        "/api/v1/farmers",
        headers=officer_headers,
        json={
            "name": "Suresh Patel",
            "mobile_number": "9876540002",
            "village": "Anandpur",
            "district": "Anand",
            "state": "Gujarat",
            "status": "ACTIVE",
        },
    )

    search_resp = client.get("/api/v1/farmers?search=Patel", headers=officer_headers)
    assert search_resp.status_code == 200
    items = search_resp.json()
    assert any(f["name"] == "Suresh Patel" for f in items)
