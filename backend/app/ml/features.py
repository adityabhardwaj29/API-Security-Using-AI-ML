import datetime
from typing import Dict, List, Any, Optional
import numpy as np
from sqlalchemy.orm import Session
from backend.app.models.api_log import ApiLog


class FeatureEngineer:
    """
    Extracts structured behavioral feature vectors from raw API logs over configurable time windows.
    Fulfills Section 14 requirements for real-time anomaly detection and XAI.
    """
    FEATURE_NAMES = [
        "requests_per_minute",
        "request_count",
        "unique_endpoints",
        "error_rate",
        "average_response_time",
        "payment_frequency",
        "admin_access_frequency",
        "failed_login_count",
        "endpoint_transition_frequency",
        "request_size",
        "status_code_distribution",
        "recent_activity_score",
        "sensitive_endpoint_access",
        "behaviour_deviation",
    ]

    def __init__(self, window_minutes: int = 15):
        self.window_minutes = window_minutes

    def extract_user_features(
        self,
        db: Session,
        user_id: Optional[int],
        ip_address: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Extract behavioral feature vector for a specific user or IP over the sliding window.
        """
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=self.window_minutes)

        query = db.query(ApiLog).filter(ApiLog.timestamp >= cutoff)
        if user_id is not None:
            query = query.filter(ApiLog.user_id == user_id)
        elif ip_address is not None:
            query = query.filter(ApiLog.ip_address == ip_address)
        else:
            return self._get_default_features()

        logs: List[ApiLog] = query.order_by(ApiLog.timestamp.asc()).all()

        if not logs:
            return self._get_default_features()

        return self._compute_features_from_logs(logs)

    def extract_features_from_log_records(self, logs: List[ApiLog]) -> Dict[str, float]:
        if not logs:
            return self._get_default_features()
        return self._compute_features_from_logs(logs)

    def _compute_features_from_logs(self, logs: List[ApiLog]) -> Dict[str, float]:
        total_requests = len(logs)
        if total_requests == 0:
            return self._get_default_features()

        # Calculate time span in minutes
        min_time = min(log.timestamp for log in logs)
        max_time = max(log.timestamp for log in logs)
        time_span_minutes = max((max_time - min_time).total_seconds() / 60.0, 0.2)  # minimum 12 seconds

        requests_per_minute = total_requests / time_span_minutes

        endpoints = [log.endpoint for log in logs]
        unique_endpoints = len(set(endpoints))

        error_logs = [log for log in logs if log.status_code >= 400]
        error_rate = len(error_logs) / total_requests

        avg_latency = float(np.mean([log.response_time for log in logs]))

        # Payment & Admin Action Frequencies
        payment_logs = [
            log for log in logs
            if "/payment" in log.endpoint or log.event_type in ("PAYMENT", "PAYMENT_INITIATED", "PAYMENT_VERIFICATION")
        ]
        payment_frequency = len(payment_logs)

        admin_logs = [
            log for log in logs
            if "/admin" in log.endpoint or log.event_type in ("ADMIN", "ADMIN_ACCESS")
        ]
        admin_access_frequency = len(admin_logs)

        failed_logins = len([
            log for log in logs
            if ("/auth/login" in log.endpoint or log.event_type in ("AUTH", "FAILED_LOGIN"))
            and log.status_code in (401, 403, 422)
        ])

        # Unusual endpoint transition frequency
        unusual_transitions = 0
        for i in range(len(endpoints) - 1):
            src, dst = endpoints[i], endpoints[i + 1]
            if "/admin" in dst and not ("/auth" in src or "/admin" in src):
                unusual_transitions += 1
            elif "/payment" in dst and not ("/checkout" in src or "/cart" in src or "/payment" in src or "/orders" in src):
                unusual_transitions += 1

        endpoint_transition_frequency = float(unusual_transitions)
        avg_request_size = float(np.mean([log.request_size for log in logs]))

        # Additional Section 14 Features:
        # 1. status_code_distribution (ratio of non-200 responses)
        non_200_count = len([log for log in logs if log.status_code != 200 and log.status_code != 201])
        status_code_distribution = round(non_200_count / total_requests, 4)

        # 2. recent_activity_score (weighted intensity in the last 2 minutes vs rest of window)
        two_mins_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=2)
        recent_count = len([log for log in logs if log.timestamp >= two_mins_ago])
        recent_activity_score = round(min(recent_count / max(total_requests, 1) * (requests_per_minute / 10.0), 10.0), 3)

        # 3. sensitive_endpoint_access (payments + admin + auth total proportion)
        sensitive_count = payment_frequency + admin_access_frequency + failed_logins
        sensitive_endpoint_access = round(min(sensitive_count / max(total_requests, 1), 1.0), 3)

        # 4. behaviour_deviation (heuristic distance score from expected baseline)
        dev_score = (
            max(requests_per_minute - 15.0, 0) / 20.0 +
            payment_frequency * 0.25 +
            admin_access_frequency * 0.40 +
            failed_logins * 0.30 +
            unusual_transitions * 0.35
        )
        behaviour_deviation = round(min(dev_score, 1.0), 3)

        return {
            "requests_per_minute": round(requests_per_minute, 2),
            "request_count": total_requests,
            "unique_endpoints": unique_endpoints,
            "error_rate": round(error_rate, 4),
            "average_response_time": round(avg_latency, 2),
            "payment_frequency": payment_frequency,
            "admin_access_frequency": admin_access_frequency,
            "failed_login_count": failed_logins,
            "endpoint_transition_frequency": endpoint_transition_frequency,
            "request_size": round(avg_request_size, 2),
            "status_code_distribution": status_code_distribution,
            "recent_activity_score": recent_activity_score,
            "sensitive_endpoint_access": sensitive_endpoint_access,
            "behaviour_deviation": behaviour_deviation,
        }

    def _get_default_features(self) -> Dict[str, float]:
        return {
            "requests_per_minute": 1.0,
            "request_count": 1,
            "unique_endpoints": 1,
            "error_rate": 0.0,
            "average_response_time": 45.0,
            "payment_frequency": 0,
            "admin_access_frequency": 0,
            "failed_login_count": 0,
            "endpoint_transition_frequency": 0.0,
            "request_size": 256.0,
            "status_code_distribution": 0.0,
            "recent_activity_score": 0.1,
            "sensitive_endpoint_access": 0.0,
            "behaviour_deviation": 0.0,
        }

    def to_feature_vector(self, feature_dict: Dict[str, float]) -> np.ndarray:
        return np.array([[feature_dict.get(name, 0.0) for name in self.FEATURE_NAMES]], dtype=np.float32)


feature_engineer = FeatureEngineer(window_minutes=15)
