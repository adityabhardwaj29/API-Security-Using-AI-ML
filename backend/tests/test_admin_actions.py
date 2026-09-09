import pytest


def test_admin_settings_update(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@apisecurity.io",
        "password": "admin123"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get settings
    get_res = client.get("/api/admin/settings", headers=headers)
    assert get_res.status_code == 200
    assert "thresholds" in get_res.json()

    # Update settings
    put_res = client.put("/api/admin/settings", json={
        "medium_threshold": 0.42,
        "high_threshold": 0.72,
        "critical_threshold": 0.89,
        "upi_id": "aadityabhardwaj5398@oksbi",
        "payment_mode": "demo"
    }, headers=headers)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["settings"]["thresholds"]["medium"] == 0.42
    assert data["settings"]["upi_id"] == "aadityabhardwaj5398@oksbi"


def test_admin_user_management(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@apisecurity.io",
        "password": "admin123"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List users
    users_res = client.get("/api/admin/users", headers=headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) > 0

    target_user = users[0]
    user_id = target_user["id"]

    # Toggle status
    toggle_res = client.post(f"/api/admin/users/{user_id}/toggle-status", headers=headers)
    assert toggle_res.status_code == 200
    assert "is_active" in toggle_res.json()

    # Toggle back
    toggle_back = client.post(f"/api/admin/users/{user_id}/toggle-status", headers=headers)
    assert toggle_back.status_code == 200

    # Reset risk
    reset_res = client.post(f"/api/admin/users/{user_id}/reset-risk", headers=headers)
    assert reset_res.status_code == 200


def test_admin_payment_override(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@apisecurity.io",
        "password": "admin123"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a user payment first
    user_login = client.post("/api/auth/login", json={
        "email": "user@apisecurity.io",
        "password": "User@123456"
    })
    user_token = user_login.json()["access_token"]
    pay_res = client.post("/api/payments", json={
        "amount": 499.0,
        "currency": "INR",
        "payment_method": "UPI",
        "upi_id": "aadityabhardwaj5398@oksbi"
    }, headers={"Authorization": f"Bearer {user_token}"})
    payment_id = pay_res.json()["id"]

    # Admin overrides payment status to COMPLETED
    override_res = client.post(f"/api/admin/payments/{payment_id}/override", json={
        "action": "APPROVE"
    }, headers=headers)
    assert override_res.status_code == 200
    assert override_res.json()["payment"]["status"] == "COMPLETED"


def test_threat_actions_and_isolation_forest_retrain(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@apisecurity.io",
        "password": "admin123"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Retrain Isolation Forest
    retrain_res = client.post("/api/admin/models/retrain-isolation-forest", headers=headers)
    assert retrain_res.status_code == 200
    assert retrain_res.json()["status"] == "ACTIVE & FITTED"

    # Export telemetry
    export_res = client.get("/api/admin/telemetry/export", headers=headers)
    assert export_res.status_code == 200
    assert "telemetry_summary" in export_res.json()
