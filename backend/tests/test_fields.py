def test_create_field_with_polygon(client, officer_headers):
    farmer_resp = client.post(
        "/api/v1/farmers",
        headers=officer_headers,
        json={
            "name": "Harjit Singh",
            "mobile_number": "9876540010",
            "village": "Khanna",
            "district": "Ludhiana",
            "state": "Punjab",
        },
    )
    assert farmer_resp.status_code == 201
    farmer_id = farmer_resp.json()["id"]

    # GeoJSON polygon (closed ring with >= 4 points)
    polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [75.8573, 30.9010],
                [75.8573, 30.9020],
                [75.8590, 30.9020],
                [75.8573, 30.9010],
            ]
        ],
    }
    field_resp = client.post(
        "/api/v1/fields",
        headers=officer_headers,
        json={
            "farmer_id": farmer_id,
            "field_name": "North Field A",
            "area": 4.5,
            "crop": "Wheat",
            "village": "Khanna",
            "district": "Ludhiana",
            "polygon": polygon,
            "polygon_color": "GREEN",
        },
    )
    assert field_resp.status_code == 201
    field_data = field_resp.json()
    assert field_data["field_name"] == "North Field A"
    assert field_data["polygon"]["type"] == "Polygon"
    assert field_data["polygon_color"] == "GREEN"


def test_delete_field_polygon(client, officer_headers):
    farmer_resp = client.post(
        "/api/v1/farmers",
        headers=officer_headers,
        json={
            "name": "Kiran Rao",
            "mobile_number": "9876540011",
            "village": "Mandya",
            "district": "Mandya",
            "state": "Karnataka",
        },
    )
    farmer_id = farmer_resp.json()["id"]

    polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [75.8573, 30.9010],
                [75.8573, 30.9020],
                [75.8590, 30.9020],
                [75.8573, 30.9010],
            ]
        ],
    }
    field_resp = client.post(
        "/api/v1/fields",
        headers=officer_headers,
        json={
            "farmer_id": farmer_id,
            "field_name": "South Field",
            "area": 3.0,
            "polygon": polygon,
            "polygon_color": "YELLOW",
        },
    )
    field_id = field_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/fields/{field_id}/polygon", headers=officer_headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["polygon"] is None
