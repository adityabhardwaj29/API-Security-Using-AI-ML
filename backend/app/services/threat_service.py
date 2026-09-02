import datetime
import asyncio
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.threat import Threat
from backend.app.models.explanation import ThreatExplanation
from backend.app.models.security_event import SecurityEvent
from backend.app.models.user import User
from backend.app.explainability.shap_explainer import threat_explainer
from backend.app.llm.explanation import llm_synthesizer
from backend.app.realtime.websocket import ws_manager


class ThreatService:
    """
    Orchestrates threat detection lifecycle:
    1. Records Threat in database
    2. Runs XAI (SHAP / Fallback importance)
    3. Synthesizes human-readable LLM explanation & actionable recommendation
    4. Records Explanation and Security Event
    5. Broadcasts real-time alert via WebSocket to Admin SOC
    """
    def create_threat_and_broadcast(
        self,
        db: Session,
        user_id: Optional[int],
        endpoint: str,
        event_type: str,
        risk_evaluation: Dict[str, Any],
        features: Dict[str, float],
        ip_address: Optional[str] = "127.0.0.1"
    ) -> Threat:
        threat_type = risk_evaluation.get("threat_type") or "BEHAVIORAL_API_ANOMALY"
        risk_score = risk_evaluation.get("risk_score", 0.75)
        risk_level = risk_evaluation.get("risk_level", "HIGH")
        anomaly_score = risk_evaluation.get("ml_anomaly_score", risk_score)
        rule_reasons = risk_evaluation.get("rule_reasons", [])

        # 1. Create Threat entity
        threat = Threat(
            user_id=user_id,
            endpoint=endpoint,
            event_type=event_type,
            threat_type=threat_type,
            anomaly_score=anomaly_score,
            confidence=0.88,
            risk_level=risk_level,
            status="ACTIVE",
            action_taken="SECURITY_ALERT_BROADCAST",
            details=", ".join(rule_reasons) if rule_reasons else "Statistical behavioral anomaly detected",
            created_at=datetime.datetime.utcnow(),
        )
        db.add(threat)
        db.flush()  # Obtain threat.id

        # 2. XAI / SHAP Feature Attribution
        xai_features, xai_method = threat_explainer.explain(features)

        # 3. LLM Threat Synthesis
        explanation_text, recommendation_text, model_name = llm_synthesizer.generate_explanation(
            threat_type=threat_type,
            risk_score=risk_score,
            risk_level=risk_level,
            endpoint=endpoint,
            features=features,
            xai_attributions=xai_features,
            rule_reasons=rule_reasons
        )

        # 4. Save Explanation
        explanation = ThreatExplanation(
            threat_id=threat.id,
            method=xai_method,
            important_features=xai_features,
            explanation=explanation_text,
            recommendation=recommendation_text,
            llm_model=model_name,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(explanation)

        # 5. Create Security Event
        sec_event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            severity=risk_level,
            risk_score=risk_score,
            message=f"Threat detected: {threat_type} on {endpoint} (Risk: {risk_score * 100:.1f}%)",
            source_ip=ip_address,
            endpoint=endpoint,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(sec_event)
        db.commit()
        db.refresh(threat)

        # 6. Real-time WebSocket dispatch (async task)
        user_obj = db.query(User).filter(User.id == user_id).first() if user_id else None
        threat_payload = {
            "id": threat.id,
            "user_id": user_id,
            "user_email": user_obj.email if user_obj else "Anonymous / Unknown",
            "endpoint": threat.endpoint,
            "event_type": threat.event_type,
            "threat_type": threat.threat_type,
            "anomaly_score": threat.anomaly_score,
            "risk_score": risk_score,
            "risk_level": threat.risk_level,
            "status": threat.status,
            "action_taken": threat.action_taken,
            "details": threat.details,
            "explanation": explanation_text,
            "recommendation": recommendation_text,
            "xai_method": xai_method,
            "top_features": xai_features[:3],
            "created_at": threat.created_at.isoformat(),
        }

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(ws_manager.broadcast_threat_alert(threat_payload))
            else:
                loop.run_until_complete(ws_manager.broadcast_threat_alert(threat_payload))
        except Exception:
            pass

        return threat


threat_service = ThreatService()
