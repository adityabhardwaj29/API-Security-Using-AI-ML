import os
import json
import requests
from typing import Dict, List, Any, Tuple
from backend.app.config import settings


class LLMExplanationSynthesizer:
    """
    Generates human-readable Security Operations Center (SOC) threat explanations
    from structured XAI evidence and behavioral telemetry.

    CRITICAL PRINCIPLES:
    1. LLM NEVER decides ALLOW vs BLOCK.
    2. Primary security decisions come strictly from deterministic logic + validated ML/GNN.
    3. If no LLM API key is present, generates a clearly labelled deterministic synthesis.
    """
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.api_base = settings.LLM_API_BASE
        self.model = settings.LLM_MODEL

    def generate_explanation(
        self,
        threat_type: str,
        risk_score: float,
        risk_level: str,
        endpoint: str,
        features: Dict[str, float],
        xai_attributions: List[Dict[str, Any]],
        rule_reasons: List[str]
    ) -> Tuple[str, str, str]:
        """
        Synthesizes structured security explanation and recommendations.
        Returns (explanation_text, recommendation_text, model_identifier).
        """
        # Filter top important features
        top_features = [
            f"{feat['feature']} (observed: {feat['observed_value']}, importance: {feat['importance_level']})"
            for feat in xai_attributions[:4]
        ]

        if self.api_key and len(self.api_key.strip()) > 5:
            try:
                explanation, recommendation = self._call_llm_api(
                    threat_type=threat_type,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    endpoint=endpoint,
                    features=features,
                    top_features=top_features,
                    rule_reasons=rule_reasons
                )
                return explanation, recommendation, f"OpenAI-{self.model}"
            except Exception:
                pass  # Fallback gracefully if external LLM fails

        # Deterministic security synthesis
        explanation, recommendation = self._generate_deterministic_synthesis(
            threat_type=threat_type,
            risk_score=risk_score,
            risk_level=risk_level,
            endpoint=endpoint,
            features=features,
            xai_attributions=xai_attributions,
            rule_reasons=rule_reasons
        )
        return explanation, recommendation, "deterministic_rule_engine"

    def _call_llm_api(
        self,
        threat_type: str,
        risk_score: float,
        risk_level: str,
        endpoint: str,
        features: Dict[str, float],
        top_features: List[str],
        rule_reasons: List[str]
    ) -> Tuple[str, str]:
        system_prompt = (
            "You are a Senior SOC Security Analyst. Your task is to review structured API threat telemetry "
            "and produce a concise, professional security incident explanation and remediation recommendation. "
            "Output JSON format with two keys: 'explanation' and 'recommendation'. Do not include markdown formatting or extra text."
        )

        user_content = {
            "threat_classification": threat_type,
            "risk_score": f"{risk_score * 100:.1f}%",
            "severity_level": risk_level,
            "targeted_endpoint": endpoint,
            "top_xai_contributing_factors": top_features,
            "observed_rule_violations": rule_reasons,
            "raw_metrics": {
                "requests_per_minute": features.get("requests_per_minute", 0),
                "payment_frequency": features.get("payment_frequency", 0),
                "failed_logins": features.get("failed_login_count", 0),
                "error_rate": features.get("error_rate", 0),
            }
        }

        url = f"{self.api_base.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_content)},
            ],
            "temperature": 0.2,
            "max_tokens": 400,
        }

        response = requests.post(url, headers=headers, json=payload, timeout=6.0)
        response.raise_for_status()
        data = response.json()
        raw_text = data["choices"][0]["message"]["content"].strip()

        # Parse JSON
        parsed = json.loads(raw_text)
        return parsed.get("explanation", ""), parsed.get("recommendation", "")

    def _generate_deterministic_synthesis(
        self,
        threat_type: str,
        risk_score: float,
        risk_level: str,
        endpoint: str,
        features: Dict[str, float],
        xai_attributions: List[Dict[str, Any]],
        rule_reasons: List[str]
    ) -> Tuple[str, str]:
        """
        Produces clear, accurate deterministic security explanations.
        """
        rpm = features.get("requests_per_minute", 0.0)
        pay_freq = features.get("payment_frequency", 0)
        failed_logins = features.get("failed_login_count", 0)
        error_rate = features.get("error_rate", 0.0)

        summary_points = []
        if threat_type == "HIGH_RATE_PAYMENT_ANOMALY":
            summary_points.append(
                f"Abnormal payment initiation frequency detected on endpoint {endpoint}. "
                f"The client performed {pay_freq} payment attempts within the sliding window at {rpm:.1f} req/min."
            )
        elif threat_type == "UNAUTHORIZED_ADMIN_PROBE":
            summary_points.append(
                f"Unauthorized privilege probe detected on administrative resource {endpoint}. "
                f"A non-administrative session attempted to access restricted management routes."
            )
        elif threat_type == "BRUTE_FORCE_AUTHENTICATION_ATTEMPT":
            summary_points.append(
                f"Credential brute-force velocity anomaly observed on {endpoint}. "
                f"Target recorded {failed_logins} consecutive failed login attempts with high error rate ({error_rate * 100:.1f}%)."
            )
        elif threat_type == "UNUSUAL_API_WORKFLOW_BYPASS":
            summary_points.append(
                f"Unusual API workflow transition pattern detected on {endpoint}. "
                f"Client executed sensitive state transitions bypassing standard shopping/checkout sequences."
            )
        else:
            summary_points.append(
                f"Behavioral deviation detected on {endpoint} with risk score {risk_score * 100:.1f}%. "
                f"Traffic parameters diverged significantly from baseline user activity distributions."
            )

        # Append top XAI feature drivers
        top_driver_names = [f["feature"] for f in xai_attributions[:3] if f.get("importance", 0) > 0.3]
        if top_driver_names:
            summary_points.append(f"Primary contributing indicators identified by XAI: {', '.join(top_driver_names)}.")

        explanation_text = " ".join(summary_points)

        # Actionable recommendations
        if risk_level in ("HIGH", "CRITICAL"):
            recommendation_text = (
                "1. Enforce Multi-Factor Authentication (MFA) step-up challenge.\n"
                "2. Apply rate-limiting token bucket to client IP/Session.\n"
                "3. Place high-value transaction on security review hold.\n"
                "4. Monitor API flow graph for lateral transition attempts."
            )
        else:
            recommendation_text = (
                "1. Continue passive session telemetry monitoring.\n"
                "2. Log subsequent endpoint transitions to verify normal browsing pattern.\n"
                "3. No immediate blocking action required."
            )

        return explanation_text, recommendation_text


llm_synthesizer = LLMExplanationSynthesizer()
