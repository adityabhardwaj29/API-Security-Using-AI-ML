from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.threat import Threat
from backend.app.models.explanation import ThreatExplanation
from backend.app.models.user import User
from backend.app.schemas.threat import (
    ThreatResponse,
    ExplanationResponse,
    ThreatActionRequest,
    FeatureAttribution,
)
from backend.app.security.permissions import require_admin

router = APIRouter(prefix="/threats", tags=["Threats"])


@router.get("", response_model=List[ThreatResponse])
def list_threats(
    risk_level: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    user_id: Optional[int] = Query(None),
    limit: int = Query(50, le=150),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    query = db.query(Threat)
    if risk_level:
        query = query.filter(Threat.risk_level == risk_level.upper())
    if status_filter:
        query = query.filter(Threat.status == status_filter.upper())
    if user_id:
        query = query.filter(Threat.user_id == user_id)

    threats = query.order_by(Threat.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for t in threats:
        explanation_resp = None
        if t.explanation:
            explanation_resp = ExplanationResponse(
                id=t.explanation.id,
                threat_id=t.explanation.threat_id,
                method=t.explanation.method,
                important_features=[FeatureAttribution(**feat) for feat in t.explanation.important_features],
                explanation=t.explanation.explanation,
                recommendation=t.explanation.recommendation,
                llm_model=t.explanation.llm_model,
                created_at=t.explanation.created_at,
            )

        result.append(
            ThreatResponse(
                id=t.id,
                user_id=t.user_id,
                endpoint=t.endpoint,
                event_type=t.event_type,
                threat_type=t.threat_type,
                anomaly_score=t.anomaly_score,
                confidence=t.confidence,
                risk_level=t.risk_level,
                status=t.status,
                action_taken=t.action_taken,
                details=t.details,
                created_at=t.created_at,
                user=t.user,
                explanation=explanation_resp,
            )
        )
    return result


@router.get("/{threat_id}", response_model=ThreatResponse)
def get_threat(
    threat_id: int,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    t = db.query(Threat).filter(Threat.id == threat_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found.")

    explanation_resp = None
    if t.explanation:
        explanation_resp = ExplanationResponse(
            id=t.explanation.id,
            threat_id=t.explanation.threat_id,
            method=t.explanation.method,
            important_features=[FeatureAttribution(**feat) for feat in t.explanation.important_features],
            explanation=t.explanation.explanation,
            recommendation=t.explanation.recommendation,
            llm_model=t.explanation.llm_model,
            created_at=t.explanation.created_at,
        )

    return ThreatResponse(
        id=t.id,
        user_id=t.user_id,
        endpoint=t.endpoint,
        event_type=t.event_type,
        threat_type=t.threat_type,
        anomaly_score=t.anomaly_score,
        confidence=t.confidence,
        risk_level=t.risk_level,
        status=t.status,
        action_taken=t.action_taken,
        details=t.details,
        created_at=t.created_at,
        user=t.user,
        explanation=explanation_resp,
    )


@router.post("/{threat_id}/action", response_model=ThreatResponse)
def update_threat_action(
    threat_id: int,
    req: ThreatActionRequest,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    t = db.query(Threat).filter(Threat.id == threat_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found.")

    action_upper = req.action.upper()
    if action_upper == "ACKNOWLEDGE":
        t.status = "ACKNOWLEDGED"
        t.action_taken = "SOC_ANALYST_ACKNOWLEDGED"
    elif action_upper == "MITIGATE":
        t.status = "MITIGATED"
        t.action_taken = "SECURITY_CONTROLS_APPLIED"
    elif action_upper == "FALSE_POSITIVE":
        t.status = "FALSE_POSITIVE"
        t.action_taken = "MARKED_FALSE_POSITIVE"

    if req.notes:
        t.details = f"{t.details or ''} | Analyst Notes: {req.notes}".strip(" |")

    db.commit()
    db.refresh(t)

    explanation_resp = None
    if t.explanation:
        explanation_resp = ExplanationResponse(
            id=t.explanation.id,
            threat_id=t.explanation.threat_id,
            method=t.explanation.method,
            important_features=[FeatureAttribution(**feat) for feat in t.explanation.important_features],
            explanation=t.explanation.explanation,
            recommendation=t.explanation.recommendation,
            llm_model=t.explanation.llm_model,
            created_at=t.explanation.created_at,
        )

    return ThreatResponse(
        id=t.id,
        user_id=t.user_id,
        endpoint=t.endpoint,
        event_type=t.event_type,
        threat_type=t.threat_type,
        anomaly_score=t.anomaly_score,
        confidence=t.confidence,
        risk_level=t.risk_level,
        status=t.status,
        action_taken=t.action_taken,
        details=t.details,
        created_at=t.created_at,
        user=t.user,
        explanation=explanation_resp,
    )
