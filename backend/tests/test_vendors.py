def test_create_vendor_admin(client, admin_headers):
    response = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "IFFCO Seeds",
            "company_name": "IFFCO Seeds Ltd",
            "contact_person": "Ramesh Kumar",
            "mobile_number": "9876543201",
            "email": "ramesh@iffco.in",
            "address": "IFFCO Sadan, Saket",
            "gstin": "07AAAAA0000A1Z5",
            "status": "ACTIVE",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["vendor_name"] == "IFFCO Seeds"
    assert data["status"] == "ACTIVE"
    assert "id" in data


def test_create_vendor_forbidden_for_officer(client, officer_headers):
    response = client.post(
        "/api/v1/vendors",
        headers=officer_headers,
        json={
            "vendor_name": "Unauthorized Vendor",
            "company_name": "Unauthorized Inc",
            "contact_person": "John Doe",
            "mobile_number": "9876543202",
        },
    )
    assert response.status_code == 403


def test_list_and_get_vendors(client, admin_headers):
    create_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "Mahyco Seeds",
            "company_name": "Maharashtra Hybrid Seeds Co",
            "contact_person": "Vikas Sharma",
            "mobile_number": "9876543203",
        },
    )
    assert create_resp.status_code == 201
    vendor_id = create_resp.json()["id"]

    list_resp = client.get("/api/v1/vendors", headers=admin_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    get_resp = client.get(f"/api/v1/vendors/{vendor_id}", headers=admin_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["vendor_name"] == "Mahyco Seeds"


def test_update_vendor(client, admin_headers):
    create_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "Rasi Seeds",
            "company_name": "Rasi Seeds Pvt Ltd",
            "contact_person": "M. Ramaswamy",
            "mobile_number": "9876543204",
        },
    )
    vendor_id = create_resp.json()["id"]

    update_resp = client.patch(
        f"/api/v1/vendors/{vendor_id}",
        headers=admin_headers,
        json={"address": "Salem, Tamil Nadu"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["address"] == "Salem, Tamil Nadu"


def test_soft_delete_vendor(client, admin_headers):
    create_resp = client.post(
        "/api/v1/vendors",
        headers=admin_headers,
        json={
            "vendor_name": "Pioneer Seeds",
            "company_name": "Pioneer Hi-Bred",
            "contact_person": "Anand Mohan",
            "mobile_number": "9876543205",
        },
    )
    vendor_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/vendors/{vendor_id}", headers=admin_headers)
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/vendors/{vendor_id}", headers=admin_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "INACTIVE"
