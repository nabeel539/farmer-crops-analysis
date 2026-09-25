"""Tests for Reports & Analytics Summary API."""

def test_get_dashboard_summary(client, admin_headers):
    response = client.get("/api/v1/reports/summary", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_farmers" in data
    assert "total_fields" in data
    assert "expected_production_kg" in data
    assert "average_ndvi" in data


def test_get_variety_performance(client, admin_headers):
    response = client.get("/api/v1/reports/variety-performance", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_export_farmers_csv(client, admin_headers):
    response = client.get("/api/v1/reports/export/farmers-csv", headers=admin_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "ID,Name,Mobile,Village" in response.text
