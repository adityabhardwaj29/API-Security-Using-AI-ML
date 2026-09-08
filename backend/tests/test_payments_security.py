def test_normal_payment_flow(client):
    login_resp = client.post("/api/auth/login", json={
        "email": "user@apisecurity.io",
        "password": "User@123456"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Normal payment
    pay_resp = client.post("/api/payments", json={
        "amount": 99.99,
        "currency": "USD",
        "payment_method": "DEMO_CARD"
    }, headers=headers)

    assert pay_resp.status_code == 200
    data = pay_resp.json()
    assert data["status"] in ("COMPLETED", "VERIFICATION_REQUIRED")
    assert "risk_score" in data


def test_admin_route_protection(client):
    # Standard user attempting to access admin route -> 403 Forbidden
    login_resp = client.post("/api/auth/login", json={
        "email": "user@apisecurity.io",
        "password": "User@123456"
    })
    user_token = login_resp.json()["access_token"]

    resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 403

    # Admin user accessing admin route -> 200 OK
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@apisecurity.io",
        "password": "admin123"
    })
    admin_token = admin_login.json()["access_token"]

    admin_resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_resp.status_code == 200
    assert "total_api_requests" in admin_resp.json()
