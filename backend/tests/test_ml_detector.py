import numpy as np
from backend.app.ml.features import feature_engineer
from backend.app.ml.detector import detector
from backend.app.ml.risk_engine import risk_engine
from backend.app.explainability.shap_explainer import threat_explainer


def test_feature_extraction_and_vectorization():
    features = {
        "requests_per_minute": 4.5,
        "request_count": 12,
        "unique_endpoints": 4,
        "error_rate": 0.0,
        "average_response_time": 42.0,
        "payment_frequency": 1,
        "admin_access_frequency": 0,
        "failed_login_count": 0,
        "endpoint_transition_frequency": 0.0,
        "request_size": 280.0,
        "status_code_distribution": 0.0,
        "recent_activity_score": 0.1,
        "sensitive_endpoint_access": 0,
        "behaviour_deviation": 0.05,
    }
    vec = feature_engineer.to_feature_vector(features)
    assert vec.shape == (1, 14)


def test_isolation_forest_scoring():
    normal_features = {
        "requests_per_minute": 3.0,
        "request_count": 8,
        "unique_endpoints": 3,
        "error_rate": 0.0,
        "average_response_time": 40.0,
        "payment_frequency": 0,
        "admin_access_frequency": 0,
        "failed_login_count": 0,
        "endpoint_transition_frequency": 0.0,
        "request_size": 300.0,
        "status_code_distribution": 0.0,
        "recent_activity_score": 0.1,
        "sensitive_endpoint_access": 0,
        "behaviour_deviation": 0.0,
    }
    score, is_anom = detector.score_features(normal_features)
    assert 0.0 <= score <= 1.0

    anomalous_features = {
        "requests_per_minute": 95.0,
        "request_count": 150,
        "unique_endpoints": 2,
        "error_rate": 0.55,
        "average_response_time": 180.0,
        "payment_frequency": 12,
        "admin_access_frequency": 5,
        "failed_login_count": 8,
        "endpoint_transition_frequency": 3.0,
        "request_size": 1200.0,
        "status_code_distribution": 0.55,
        "recent_activity_score": 0.95,
        "sensitive_endpoint_access": 1,
        "behaviour_deviation": 0.85,
    }
    anom_score, is_anom_flag = detector.score_features(anomalous_features)
    assert anom_score > score


def test_risk_engine_evaluation():
    anomalous_features = {
        "requests_per_minute": 75.0,
        "request_count": 50,
        "unique_endpoints": 3,
        "error_rate": 0.20,
        "average_response_time": 60.0,
        "payment_frequency": 6,
        "admin_access_frequency": 0,
        "failed_login_count": 0,
        "endpoint_transition_frequency": 1.0,
        "request_size": 320.0,
        "status_code_distribution": 0.20,
        "recent_activity_score": 0.75,
        "sensitive_endpoint_access": 1,
        "behaviour_deviation": 0.70,
    }
    eval_result = risk_engine.evaluate(
        features=anomalous_features,
        endpoint="/api/payments",
        method="POST",
        user_role="USER"
    )
    assert eval_result["risk_score"] >= 0.40
    assert eval_result["risk_level"] in ("HIGH", "CRITICAL", "MEDIUM")


def test_shap_xai_explanation():
    anomalous_features = {
        "requests_per_minute": 80.0,
        "request_count": 60,
        "unique_endpoints": 2,
        "error_rate": 0.1,
        "average_response_time": 50.0,
        "payment_frequency": 7,
        "admin_access_frequency": 0,
        "failed_login_count": 0,
        "endpoint_transition_frequency": 1.0,
        "request_size": 300.0,
        "status_code_distribution": 0.1,
        "recent_activity_score": 0.8,
        "sensitive_endpoint_access": 1,
        "behaviour_deviation": 0.65,
    }
    attributions, method = threat_explainer.explain(anomalous_features)
    assert method in ("SHAP", "FALLBACK_FEATURE_IMPORTANCE")
    assert len(attributions) == 14
    assert "importance" in attributions[0]
    assert "feature" in attributions[0]
