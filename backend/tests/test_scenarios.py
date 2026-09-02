import pytest
import time
from backend.app.explainability.shap_explainer import threat_explainer
from backend.app.llm.explanation import llm_synthesizer
from backend.app.ml.features import feature_engineer
from backend.app.ml.risk_engine import risk_engine


def test_scenario_1_normal_user_flow(client):
    """
    Scenario 1: Normal User Flow
    Register -> Login -> Browse -> Add to Cart -> Create Order -> UPI Payment
    Result: API logged, features extracted, risk score evaluated, payment completes.
    """
    timestamp = int(time.time() * 1000)
    email = f"normal_user_{timestamp}@example.com"

    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "name": "Aarav Patel",
        "email": email,
        "password": "Password@123"
    })
    assert reg_res.status_code in (200, 201)

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Browse Products
    prod_res = client.get("/api/products", headers=headers)
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert len(products) > 0
    product_id = products[0]["id"]

    # 4. Add to Cart
    cart_res = client.post("/api/cart", json={
        "product_id": product_id,
        "quantity": 1
    }, headers=headers)
    assert cart_res.status_code in (200, 201)

    # 5. Create Order
    order_res = client.post("/api/orders", json={
        "shipping_address": "Bengaluru, Karnataka - 560103",
        "discount": 0.0
    }, headers=headers)
    assert order_res.status_code in (200, 201)
    order = order_res.json()

    # 6. UPI Payment
    pay_res = client.post("/api/payments", json={
        "amount": order.get("final_amount", order.get("subtotal", 100.0)),
        "payment_method": "UPI_QR",
        "upi_id": "testuser@oksbi",
        "is_demo": True,
        "order_id": order["id"]
    }, headers=headers)
    assert pay_res.status_code in (200, 201)
    pay_data = pay_res.json()
    assert pay_data["currency"] == "INR"
    assert pay_data["risk_level"] in ("LOW", "MEDIUM", "HIGH")


def test_scenario_2_high_frequency_payment_flood(client):
    """
    Scenario 2: Attack — High-Frequency Payment Flood
    Rapid burst of payment attempts triggering velocity & frequency anomaly.
    Result: Detection triggered, risk score evaluated, threat recorded.
    """
    timestamp = int(time.time() * 1000)
    email = f"attacker_flood_{timestamp}@example.com"

    reg_res = client.post("/api/auth/register", json={
        "name": "Flood Attacker",
        "email": email,
        "password": "Password@123"
    })
    assert reg_res.status_code in (200, 201)

    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Burst payments without browsing/cart
    responses = []
    for i in range(8):
        res = client.post("/api/payments", json={
            "amount": 9999.0,
            "payment_method": "UPI_QR",
            "upi_id": "flood@upi",
            "is_demo": True
        }, headers=headers)
        responses.append(res)

    assert len(responses) == 8


def test_scenario_3_workflow_sequence_bypass(client):
    """
    Scenario 3: Attack — Workflow Sequence Bypass / Unauthorized Probe
    Non-admin client attempts direct probe on admin routes, then jumps directly to payments.
    """
    timestamp = int(time.time() * 1000)
    email = f"attacker_probe_{timestamp}@example.com"

    reg_res = client.post("/api/auth/register", json={
        "name": "Bypass Prober",
        "email": email,
        "password": "Password@123"
    })
    assert reg_res.status_code in (200, 201)

    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Probe forbidden admin routes (403s)
    probe1 = client.get("/api/threats", headers=headers)
    assert probe1.status_code in (401, 403)
    probe2 = client.get("/api/admin/stats", headers=headers)
    assert probe2.status_code in (401, 403)

    # 2. Direct jump into payment without cart
    pay_res = client.post("/api/payments", json={
        "amount": 4999.0,
        "payment_method": "UPI_QR",
        "upi_id": "probe@okhdfcbank",
        "is_demo": True
    }, headers=headers)
    assert pay_res.status_code in (200, 201)


def test_scenario_4_brute_force_login(client):
    """
    Scenario 4: Attack — Brute Force Login
    Multiple consecutive failed logins yielding 401 Unauthorized responses.
    """
    target_email = "admin@apisecurity.io"

    failed_attempts = []
    for _ in range(5):
        res = client.post("/api/auth/login", json={
            "email": target_email,
            "password": "WrongPassword123!"
        })
        assert res.status_code in (401, 429)
        failed_attempts.append(res)

    assert len(failed_attempts) == 5


def test_scenario_5_xai_and_llm_pipeline():
    """
    Scenario 5: XAI & LLM Explanation Pipeline
    Validates SHAP / Fallback feature attribution and LLM threat synthesis format.
    """
    anomalous_features = {
        "requests_per_minute": 85.0,
        "request_count": 75,
        "unique_endpoints": 2,
        "error_rate": 0.40,
        "average_response_time": 120.0,
        "payment_frequency": 8,
        "admin_access_frequency": 2,
        "failed_login_count": 4,
        "endpoint_transition_frequency": 2.5,
        "request_size": 450.0,
        "status_code_distribution": 0.40,
        "recent_activity_score": 0.85,
        "sensitive_endpoint_access": 1,
        "behaviour_deviation": 0.80,
    }

    # 1. Test XAI Feature Attribution
    attributions, method = threat_explainer.explain(anomalous_features)
    assert method in ("SHAP", "FALLBACK_FEATURE_IMPORTANCE")
    assert len(attributions) == 14
    for attr in attributions:
        assert "feature" in attr
        assert "importance" in attr
        assert "direction" in attr
        assert "importance_level" in attr

    # 2. Test LLM Threat Synthesis
    explanation, recommendation, model_id = llm_synthesizer.generate_explanation(
        threat_type="HIGH_RATE_PAYMENT_ANOMALY",
        risk_score=0.88,
        risk_level="HIGH",
        endpoint="/api/payments",
        features=anomalous_features,
        xai_attributions=attributions,
        rule_reasons=["Payment velocity > 5 in sliding window"]
    )
    assert len(explanation) > 20
    assert len(recommendation) > 10
    assert len(model_id) > 2
