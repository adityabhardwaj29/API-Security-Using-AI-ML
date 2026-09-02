import numpy as np
from typing import Dict, List, Any, Tuple
from backend.app.ml.features import FeatureEngineer, feature_engineer
from backend.app.ml.detector import detector

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


class ThreatExplainer:
    """
    Computes local feature importance attributions for anomalous API activity.
    Uses SHAP TreeExplainer when available, with a transparent evidence-based fallback.
    """
    FEATURE_DESCRIPTIONS = {
        "requests_per_minute": "Velocity of incoming API calls per minute",
        "request_count": "Total cumulative requests within observation window",
        "unique_endpoints": "Number of distinct API paths accessed",
        "error_rate": "Ratio of 4xx/5xx HTTP status responses",
        "average_response_time": "Mean latency in milliseconds",
        "payment_frequency": "Volume of payment invocations in observation window",
        "admin_access_frequency": "Volume of administrative resource requests",
        "failed_login_count": "Number of failed authentication attempts",
        "endpoint_transition_frequency": "Frequency of abnormal API sequence transitions",
        "request_size": "Mean size of request payloads in bytes",
    }

    def __init__(self):
        self.shap_explainer = None
        self._init_shap()

    def _init_shap(self):
        if SHAP_AVAILABLE and detector.is_fitted and detector.model is not None:
            try:
                # TreeExplainer for Isolation Forest
                self.shap_explainer = shap.TreeExplainer(detector.model)
            except Exception:
                self.shap_explainer = None

    def explain(self, features: Dict[str, float]) -> Tuple[List[Dict[str, Any]], str]:
        """
        Calculates feature attributions. Returns (list_of_attributions, method_name).
        Method name is strictly 'SHAP' or 'FALLBACK_FEATURE_IMPORTANCE'.
        """
        if self.shap_explainer is None:
            self._init_shap()

        if SHAP_AVAILABLE and self.shap_explainer is not None:
            try:
                X = feature_engineer.to_feature_vector(features)
                X_scaled = detector.scaler.transform(X)
                shap_values = self.shap_explainer.shap_values(X_scaled)

                # shap_values shape: (1, n_features)
                vals = shap_values[0] if isinstance(shap_values, np.ndarray) and shap_values.ndim == 2 else shap_values

                attributions = []
                max_abs_val = float(np.max(np.abs(vals))) + 1e-6

                for idx, fname in enumerate(FeatureEngineer.FEATURE_NAMES):
                    val = float(vals[idx])
                    observed = features.get(fname, 0.0)
                    norm_imp = min(round(abs(val) / max_abs_val, 3), 1.0)

                    # For IsolationForest, negative contribution reduces decision function (increases anomaly)
                    if val < -0.01 or (fname in ("payment_frequency", "failed_login_count", "admin_access_frequency") and observed > 2):
                        direction = "INCREASES_RISK"
                    elif val > 0.01:
                        direction = "DECREASES_RISK"
                    else:
                        direction = "NEUTRAL"

                    imp_level = "LOW"
                    if norm_imp >= 0.75:
                        imp_level = "CRITICAL"
                    elif norm_imp >= 0.50:
                        imp_level = "HIGH"
                    elif norm_imp >= 0.25:
                        imp_level = "MEDIUM"

                    attributions.append({
                        "feature": fname,
                        "observed_value": observed,
                        "importance": norm_imp,
                        "importance_level": imp_level,
                        "direction": direction,
                        "description": self.FEATURE_DESCRIPTIONS.get(fname, ""),
                    })

                # Sort by importance descending
                attributions.sort(key=lambda x: x["importance"], reverse=True)
                return attributions, "SHAP"

            except Exception:
                pass  # Fall through to fallback

        # Deterministic evidence-based fallback
        return self._compute_fallback_importance(features), "FALLBACK_FEATURE_IMPORTANCE"

    def _compute_fallback_importance(self, features: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Transparent fallback feature importance mechanism based on normalized z-score deviations.
        """
        baseline_means = {
            "requests_per_minute": 5.0,
            "request_count": 10.0,
            "unique_endpoints": 3.0,
            "error_rate": 0.02,
            "average_response_time": 50.0,
            "payment_frequency": 0.3,
            "admin_access_frequency": 0.0,
            "failed_login_count": 0.1,
            "endpoint_transition_frequency": 0.0,
            "request_size": 300.0,
        }
        baseline_scales = {
            "requests_per_minute": 15.0,
            "request_count": 20.0,
            "unique_endpoints": 3.0,
            "error_rate": 0.10,
            "average_response_time": 40.0,
            "payment_frequency": 2.0,
            "admin_access_frequency": 1.0,
            "failed_login_count": 2.0,
            "endpoint_transition_frequency": 1.5,
            "request_size": 250.0,
        }

        attributions = []
        for fname in FeatureEngineer.FEATURE_NAMES:
            observed = features.get(fname, 0.0)
            mean = baseline_means.get(fname, 0.0)
            scale = baseline_scales.get(fname, 1.0)
            deviation = (observed - mean) / scale

            norm_imp = float(np.clip(abs(deviation) / 3.0, 0.0, 1.0))
            norm_imp = round(norm_imp, 3)

            direction = "INCREASES_RISK" if deviation > 0.5 else ("DECREASES_RISK" if deviation < -0.5 else "NEUTRAL")

            imp_level = "LOW"
            if norm_imp >= 0.70:
                imp_level = "CRITICAL"
            elif norm_imp >= 0.45:
                imp_level = "HIGH"
            elif norm_imp >= 0.20:
                imp_level = "MEDIUM"

            attributions.append({
                "feature": fname,
                "observed_value": observed,
                "importance": norm_imp,
                "importance_level": imp_level,
                "direction": direction,
                "description": self.FEATURE_DESCRIPTIONS.get(fname, ""),
            })

        attributions.sort(key=lambda x: x["importance"], reverse=True)
        return attributions


threat_explainer = ThreatExplainer()
