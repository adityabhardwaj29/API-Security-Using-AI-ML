import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple, Optional
from backend.app.config import settings
from backend.app.ml.features import FeatureEngineer, feature_engineer


class IsolationForestDetector:
    """
    Production-grade baseline Anomaly Detector using Scikit-Learn IsolationForest.
    Pre-fits with representative normal behavioral distributions and supports continuous learning.
    """
    def __init__(self, contamination: float = None):
        self.contamination = contamination or settings.ISOLATION_FOREST_CONTAMINATION
        self.model: Optional[IsolationForest] = None
        self.scaler = StandardScaler()
        self.is_fitted = False
        self._initialize_baseline_model()

    def _generate_synthetic_baseline(self, n_samples: int = 500) -> np.ndarray:
        """
        Generates initial baseline matrix of normal user browsing and purchasing activity across all 14 features.
        """
        np.random.seed(42)
        # 0: requests_per_minute (1 - 12)
        # 1: request_count (1 - 25)
        # 2: unique_endpoints (1 - 7)
        # 3: error_rate (0.0 - 0.05)
        # 4: average_response_time (20 - 150)
        # 5: payment_frequency (0 - 2)
        # 6: admin_access_frequency (0)
        # 7: failed_login_count (0 - 1)
        # 8: endpoint_transition_frequency (0)
        # 9: request_size (100 - 1000)
        # 10: status_code_distribution (0 - 0.05)
        # 11: recent_activity_score (0.0 - 1.0)
        # 12: sensitive_endpoint_access (0.0 - 0.2)
        # 13: behaviour_deviation (0.0 - 0.15)

        rpm = np.random.uniform(1.0, 12.0, n_samples)
        rc = np.random.randint(1, 25, n_samples)
        ue = np.random.randint(1, 7, n_samples)
        err = np.random.exponential(0.01, n_samples).clip(0.0, 0.08)
        lat = np.random.normal(50.0, 15.0, n_samples).clip(15.0, 200.0)
        pf = np.random.choice([0, 1, 2], size=n_samples, p=[0.75, 0.20, 0.05])
        aaf = np.zeros(n_samples)
        flc = np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])
        etf = np.zeros(n_samples)
        rs = np.random.normal(300.0, 80.0, n_samples).clip(50.0, 1200.0)
        scd = err.copy()
        ras = np.random.uniform(0.05, 0.8, n_samples)
        sea = (pf * 0.05).clip(0.0, 0.2)
        bd = np.random.uniform(0.0, 0.15, n_samples)

        return np.column_stack([rpm, rc, ue, err, lat, pf, aaf, flc, etf, rs, scd, ras, sea, bd])

    def _initialize_baseline_model(self):
        baseline_X = self._generate_synthetic_baseline()
        self.scaler.fit(baseline_X)
        X_scaled = self.scaler.transform(baseline_X)

        self.model = IsolationForest(
            n_estimators=120,
            contamination=self.contamination,
            random_state=42,
            max_samples="auto"
        )
        self.model.fit(X_scaled)
        self.is_fitted = True

    def train_on_data(self, X: np.ndarray):
        """
        Retrain model with updated historical log feature vectors.
        """
        if len(X) < 10:
            return
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        self.model = IsolationForest(
            n_estimators=120,
            contamination=self.contamination,
            random_state=42,
            max_samples="auto"
        )
        self.model.fit(X_scaled)
        self.is_fitted = True

    def score_features(self, feature_dict: Dict[str, float]) -> Tuple[float, bool]:
        """
        Computes anomaly score normalized to [0.0, 1.0], where 1.0 represents severe anomaly.
        Returns (normalized_score, is_anomaly).
        """
        if not self.is_fitted or self.model is None:
            self._initialize_baseline_model()

        X = feature_engineer.to_feature_vector(feature_dict)
        X_scaled = self.scaler.transform(X)

        # IsolationForest decision_function: lower means more abnormal
        raw_score = self.model.decision_function(X_scaled)[0]
        prediction = self.model.predict(X_scaled)[0]  # -1 for anomaly, 1 for normal

        # Calibrate raw_score to [0.0, 1.0]
        calibrated_score = 1.0 / (1.0 + np.exp(7.0 * (raw_score + 0.05)))
        calibrated_score = float(np.clip(calibrated_score, 0.0, 1.0))

        is_anomaly = bool(prediction == -1 or calibrated_score >= settings.RISK_THRESHOLD_HIGH)
        return calibrated_score, is_anomaly


detector = IsolationForestDetector()
