import numpy as np
from typing import Dict, Any, Tuple, Optional
from backend.app.config import settings
from backend.app.ml.detector import detector


class RiskEngine:
    """
    Multi-factor risk evaluation engine combining deterministic rule-based indicators,
    Isolation Forest anomaly scores, GNN structural sequence signals, and sensitive endpoint indicators.
    """
    def __init__(self):
        self.ml_weight = 0.45
        self.rule_weight = 0.40
        self.gnn_weight = 0.15

    def evaluate(
        self,
        features: Dict[str, float],
        endpoint: str,
        method: str,
        user_role: str = "USER",
        gnn_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Evaluate full risk profile and return risk_score, risk_level, threat_type, and recommended action.
        """
        # 1. Rule-based signal calculation [0.0, 1.0]
        rule_score, rule_reasons = self._calculate_rule_risk(features, endpoint, method, user_role)

        # 2. ML Anomaly Score calculation [0.0, 1.0]
        ml_score, is_ml_anomaly = detector.score_features(features)

        # 3. GNN structural anomaly score
        if gnn_score is None:
            # Fall back to ML + Rules proportional weighting when GNN is un-trained/not active
            total_weight = self.ml_weight + self.rule_weight
            final_risk = (self.ml_weight * ml_score + self.rule_weight * rule_score) / total_weight
        else:
            final_risk = (
                self.ml_weight * ml_score +
                self.rule_weight * rule_score +
                self.gnn_weight * gnn_score
            )

        # Ensure bounds [0.0, 1.0]
        final_risk = float(np.clip(final_risk, 0.0, 1.0))

        # 4. Map to Risk Levels
        if final_risk >= settings.RISK_THRESHOLD_CRITICAL:
            risk_level = "CRITICAL"
            recommended_action = "HOLD_AND_ALERT"
        elif final_risk >= settings.RISK_THRESHOLD_HIGH:
            risk_level = "HIGH"
            recommended_action = "ADDITIONAL_VERIFICATION"
        elif final_risk >= settings.RISK_THRESHOLD_MEDIUM:
            risk_level = "MEDIUM"
            recommended_action = "ALLOW_AND_MONITOR"
        else:
            risk_level = "LOW"
            recommended_action = "ALLOW"

        # 5. Classify Threat Type if risk elevated
        threat_type = self._classify_threat_type(features, endpoint, user_role, final_risk, rule_reasons)

        return {
            "risk_score": round(final_risk, 3),
            "risk_level": risk_level,
            "ml_anomaly_score": round(ml_score, 3),
            "rule_score": round(rule_score, 3),
            "gnn_score": round(gnn_score, 3) if gnn_score is not None else None,
            "recommended_action": recommended_action,
            "threat_type": threat_type,
            "rule_reasons": rule_reasons,
            "is_threat": bool(final_risk >= settings.RISK_THRESHOLD_HIGH or threat_type is not None),
        }

    def _calculate_rule_risk(
        self,
        features: Dict[str, float],
        endpoint: str,
        method: str,
        user_role: str
    ) -> Tuple[float, list]:
        score = 0.0
        reasons = []

        rpm = features.get("requests_per_minute", 0.0)
        pay_freq = features.get("payment_frequency", 0)
        failed_logins = features.get("failed_login_count", 0)
        error_rate = features.get("error_rate", 0.0)
        admin_freq = features.get("admin_access_frequency", 0)
        transition_anom = features.get("endpoint_transition_frequency", 0.0)

        # High request frequency flood (>40 rpm)
        if rpm > 60.0:
            score += 0.40
            reasons.append(f"Excessive request rate detected ({rpm:.1f} req/min)")
        elif rpm > 30.0:
            score += 0.20
            reasons.append(f"Elevated request rate detected ({rpm:.1f} req/min)")

        # Rapid Payment velocity
        if "/payment" in endpoint:
            if pay_freq >= 5:
                score += 0.50
                reasons.append(f"High-frequency payment burst ({pay_freq} payment calls in window)")
            elif pay_freq >= 3:
                score += 0.30
                reasons.append(f"Repeated payment attempts ({pay_freq} payment calls in window)")

        # Brute force login pattern
        if failed_logins >= 4:
            score += 0.45
            reasons.append(f"Multiple failed authentication attempts ({failed_logins} failed)")
        elif failed_logins >= 2:
            score += 0.20
            reasons.append(f"Multiple login attempts detected ({failed_logins} failed)")

        # Unauthorized Admin Probe
        if "/admin" in endpoint and user_role != "ADMIN":
            score += 0.60
            reasons.append("Unauthorized administrative endpoint probing")

        # Endpoint transition bypass (e.g. jumping straight to payment without browsing/cart)
        if transition_anom > 0.0:
            score += 0.25
            reasons.append(f"Unusual API workflow transition sequence ({int(transition_anom)} jumps)")

        # High API Error Rate
        if error_rate > 0.30:
            score += 0.25
            reasons.append(f"Abnormal API error rate ({error_rate * 100:.1f}%)")

        return float(np.clip(score, 0.0, 1.0)), reasons

    def _classify_threat_type(
        self,
        features: Dict[str, float],
        endpoint: str,
        user_role: str,
        risk_score: float,
        reasons: list
    ) -> Optional[str]:
        if risk_score < settings.RISK_THRESHOLD_MEDIUM and not reasons:
            return None

        if "/admin" in endpoint and user_role != "ADMIN":
            return "UNAUTHORIZED_ADMIN_PROBE"

        if features.get("failed_login_count", 0) >= 3:
            return "BRUTE_FORCE_AUTHENTICATION_ATTEMPT"

        if "/payment" in endpoint and (features.get("payment_frequency", 0) >= 3 or features.get("requests_per_minute", 0) > 35):
            return "HIGH_RATE_PAYMENT_ANOMALY"

        if features.get("endpoint_transition_frequency", 0) > 0:
            return "UNUSUAL_API_WORKFLOW_BYPASS"

        if features.get("requests_per_minute", 0) > 50:
            return "API_FLOOD_RATE_ANOMALY"

        if risk_score >= settings.RISK_THRESHOLD_HIGH:
            return "BEHAVIORAL_ANOMALY_ELEVATED_RISK"

        return None


risk_engine = RiskEngine()
