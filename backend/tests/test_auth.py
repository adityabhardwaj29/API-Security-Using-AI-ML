def test_register_user(client):
    payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "Password123!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "testuser@example.com"
    assert data["role"] == "USER"


def test_login_user(client):
    # Registered admin
    payload = {
        "email": "admin@apisecurity.io",
        "password": "Admin@123456"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "ADMIN"


def test_login_invalid_credentials(client):
    payload = {
        "email": "admin@apisecurity.io",
        "password": "WrongPassword!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
