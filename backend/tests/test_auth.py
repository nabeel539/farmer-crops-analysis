def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@krishi.com",
            "name": "New User",
            "mobile": "9998887776",
            "password": "password123",
            "role": "FIELD_OFFICER",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@krishi.com"
    assert data["name"] == "New User"
    assert data["role"] == "FIELD_OFFICER"
    assert "id" in data


def test_register_duplicate_email(client, admin_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": admin_user.email,
            "name": "Duplicate Admin",
            "mobile": "9998887777",
            "password": "password123",
            "role": "ADMIN",
        },
    )
    assert response.status_code == 409


def test_login_success(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@krishi.com",
            "password": "admin1234",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@krishi.com"
    assert data["user"]["role"] == "ADMIN"


def test_login_invalid_password(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@krishi.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


def test_get_me(client, admin_headers):
    response = client.get("/api/v1/auth/me", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@krishi.com"
    assert data["role"] == "ADMIN"
