import pytest
from fastapi.testclient import TestClient
from backend.app.models.user import User
from backend.app.models.payment import Payment
from backend.app.models.security_event import SecurityEvent
from backend.tests.conftest import TestingSessionLocal


def get_admin_token(client: TestClient) -> str:
    res = client.post("/api/auth/login", json={"email": "admin@apisecurity.io", "password": "admin123"})
    return res.json()["access_token"]


def get_user_token(client: TestClient) -> str:
    res = client.post("/api/auth/login", json={"email": "user@apisecurity.io", "password": "User@123456"})
    return res.json()["access_token"]


def test_user_registration_with_phone_and_admin_overview(client: TestClient):
    db = TestingSessionLocal()
    try:
        # 1. Register a new user with phone
        user_payload = {
            "name": "Aditya Sharma",
            "email": "aditya.sharma@example.in",
            "password": "SecurePassword123!",
            "phone": "+919876543210",
        }
        reg_res = client.post("/api/auth/register", json=user_payload)
        assert reg_res.status_code == 201, reg_res.text
        data = reg_res.json()
        assert data["name"] == "Aditya Sharma"
        assert data["email"] == "aditya.sharma@example.in"
        user_id = data["user_id"]

        # Verify user in database has phone
        user_in_db = db.query(User).filter(User.id == user_id).first()
        assert user_in_db is not None
        assert user_in_db.phone == "+919876543210"

        # 2. Query admin overview stats
        admin_token = get_admin_token(client)
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        stats_res = client.get("/api/admin/stats", headers=admin_headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["new_users_today"] >= 1
        assert "recent_registrations" in stats
        recent_names = [u["name"] for u in stats["recent_registrations"]]
        assert "Aditya Sharma" in recent_names
        user_reg = next(u for u in stats["recent_registrations"] if u["name"] == "Aditya Sharma")
        assert user_reg["phone"] == "+919876543210"
        assert user_reg["status"] == "Active"
    finally:
        db.close()


def test_demo_payment_auto_verification_and_detail_timeline(client: TestClient):
    user_token = get_user_token(client)
    admin_token = get_admin_token(client)
    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Initiate normal demo payment
    payment_payload = {
        "amount": 799.0,
        "currency": "INR",
        "payment_method": "UPI",
        "upi_id": "aditya@oksbi",
        "is_demo": True,
    }
    pay_res = client.post("/api/payments/create", json=payment_payload, headers=user_headers)
    assert pay_res.status_code == 200, pay_res.text
    pay_data = pay_res.json()
    assert pay_data["status"] == "COMPLETED"
    assert pay_data["verification_status"] == "verified"
    assert pay_data["verification_source"] == "demo"
    assert pay_data["provider_transaction_id"] is not None
    payment_id = pay_data["id"]

    # 2. Query admin payment detail inspection
    detail_res = client.get(f"/api/admin/payments/{payment_id}", headers=admin_headers)
    assert detail_res.status_code == 200, detail_res.text
    detail = detail_res.json()

    # User information resolution
    assert "user" in detail
    assert detail["user"]["name"] is not None
    assert detail["user"]["email"] is not None

    # Verification details
    assert detail["verification"]["status"] == "verified"
    assert detail["verification"]["source"] == "demo"
    assert detail["verification"]["mode"] == "DEMO"

    # Timeline sequential check
    timeline = detail["timeline"]
    assert len(timeline) >= 3
    event_names = [step["event"] for step in timeline]
    assert "Order & Payment Initiated" in event_names
    assert "Payment Verified" in event_names
    assert "Risk Engine & ML Pipeline Analysis" in event_names
    assert "Security Decision Logged" in event_names


def test_payment_webhook_idempotency(client: TestClient):
    db = TestingSessionLocal()
    try:
        provider_tx_id = "TXN-GATEWAY-IDEMPOTENT-889911"
        webhook_payload = {
            "provider_transaction_id": provider_tx_id,
            "amount": 1299.0,
            "currency": "INR",
            "status": "SUCCESS",
            "upi_id": "merchant@hdfc",
            "signature": "simulated_valid_sha256_sig",
        }

        # First dispatch of webhook
        res1 = client.post("/api/payments/webhook", json=webhook_payload)
        assert res1.status_code == 200, res1.text
        data1 = res1.json()
        assert data1["status"] == "success"
        assert data1["idempotent"] is False
        payment_id = data1["payment_id"]

        # Second duplicate dispatch of the same webhook
        res2 = client.post("/api/payments/webhook", json=webhook_payload)
        assert res2.status_code == 200, res2.text
        data2 = res2.json()
        assert data2["status"] == "success"
        assert data2["idempotent"] is True
        assert data2["payment_id"] == payment_id

        # Third duplicate dispatch
        res3 = client.post("/api/payments/webhook", json=webhook_payload)
        assert res3.status_code == 200
        assert res3.json()["idempotent"] is True

        # Check database: only 1 payment with this provider_transaction_id exists
        count = db.query(Payment).filter(Payment.provider_transaction_id == provider_tx_id).count()
        assert count == 1
    finally:
        db.close()


def test_admin_authorization_enforcement(client: TestClient):
    user_token = get_user_token(client)
    admin_token = get_admin_token(client)
    user_headers = {"Authorization": f"Bearer {user_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Normal user must receive 403 Forbidden
    res_user_stats = client.get("/api/admin/stats", headers=user_headers)
    assert res_user_stats.status_code == 403

    res_user_payments = client.get("/api/admin/payments", headers=user_headers)
    assert res_user_payments.status_code == 403

    res_user_threats = client.get("/api/admin/threats", headers=user_headers)
    assert res_user_threats.status_code == 403

    # Admin user receives 200 OK
    res_admin_stats = client.get("/api/admin/stats", headers=admin_headers)
    assert res_admin_stats.status_code == 200

    res_admin_payments = client.get("/api/admin/payments", headers=admin_headers)
    assert res_admin_payments.status_code == 200


def test_security_events_user_resolution(client: TestClient):
    admin_token = get_admin_token(client)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    events_res = client.get("/api/admin/security/events", headers=admin_headers)
    assert events_res.status_code == 200
    events = events_res.json()
    assert isinstance(events, list)
    for ev in events:
        assert "user_name" in ev
        assert ev["user_name"] != ""  # Either resolved name or "Anonymous User"
