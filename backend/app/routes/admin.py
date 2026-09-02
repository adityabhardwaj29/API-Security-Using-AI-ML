import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.api_log import ApiLog
from backend.app.models.threat import Threat
from backend.app.models.payment import Payment
from backend.app.models.explanation import ThreatExplanation
from backend.app.schemas.admin import (
    AdminOverviewStats,
    PaymentSecurityStats,
    ModelEvaluationResult,
    SyntheticSimulationRequest,
    SyntheticSimulationResponse,
)
from backend.app.schemas.threat import ThreatResponse, ExplanationResponse, FeatureAttribution
from backend.app.schemas.user import UserInvestigationResponse
from backend.app.schemas.graph import ApiFlowGraphResponse
from backend.app.security.permissions import require_admin
from backend.app.graph.graph_builder import graph_builder
from backend.app.gnn.train import train_gnn_model
from backend.app.gnn.inference import gnn_engine
from backend.app.ml.detector import detector
from backend.app.ml.evaluation import evaluator
from backend.app.services.logging_service import logging_service
from backend.app.services.demo_generator import demo_generator

router = APIRouter(prefix="/admin", tags=["Admin SOC"])


@router.get("/stats", response_model=AdminOverviewStats)
@router.get("/dashboard", response_model=AdminOverviewStats)
def get_admin_overview_stats(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_logs = db.query(func.count(ApiLog.id)).scalar() or 0
    payment_events = db.query(func.count(ApiLog.id)).filter(
        (ApiLog.event_type == "PAYMENT") | (ApiLog.endpoint.like("%/payment%"))
    ).scalar() or 0

    # Risk breakdown from threats
    total_threats = db.query(func.count(Threat.id)).scalar() or 0
    high_risk_events = db.query(func.count(Threat.id)).filter(Threat.risk_level == "HIGH").scalar() or 0
    critical_events = db.query(func.count(Threat.id)).filter(Threat.risk_level == "CRITICAL").scalar() or 0
    medium_risk = db.query(func.count(Threat.id)).filter(Threat.risk_level == "MEDIUM").scalar() or 0
    low_risk = db.query(func.count(Threat.id)).filter(Threat.risk_level == "LOW").scalar() or 0

    normal_events = max(total_logs - total_threats, 0)
    suspicious_events = total_threats
    active_threats_count = db.query(func.count(Threat.id)).filter(Threat.status == "ACTIVE").scalar() or 0

    # Recent threats
    recent_threat_records = db.query(Threat).order_by(Threat.created_at.desc()).limit(8).all()
    recent_threats_data = []
    for t in recent_threat_records:
        exp_data = None
        if t.explanation:
            exp_data = ExplanationResponse(
                id=t.explanation.id,
                threat_id=t.explanation.threat_id,
                method=t.explanation.method,
                important_features=[FeatureAttribution(**f) for f in t.explanation.important_features],
                explanation=t.explanation.explanation,
                recommendation=t.explanation.recommendation,
                llm_model=t.explanation.llm_model,
                created_at=t.explanation.created_at,
            )
        recent_threats_data.append(
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
                explanation=exp_data,
            )
        )

    # Traffic trend (windowed breakdown)
    recent_logs = db.query(ApiLog).order_by(ApiLog.timestamp.desc()).limit(200).all()
    trend_buckets: Dict[str, Dict[str, int]] = {}
    for log in reversed(recent_logs):
        bucket_key = log.timestamp.strftime("%H:%M")
        if bucket_key not in trend_buckets:
            trend_buckets[bucket_key] = {"time": bucket_key, "requests": 0, "errors": 0, "payments": 0}
        trend_buckets[bucket_key]["requests"] += 1
        if log.status_code >= 400:
            trend_buckets[bucket_key]["errors"] += 1
        if "/payment" in log.endpoint:
            trend_buckets[bucket_key]["payments"] += 1

    traffic_trend = list(trend_buckets.values())[-12:]
    if not traffic_trend:
        now_str = datetime.datetime.utcnow().strftime("%H:%M")
        traffic_trend = [{"time": now_str, "requests": max(total_logs, 1), "errors": 0, "payments": payment_events}]

    top_endpoints = logging_service.get_endpoint_telemetry(db)[:5]

    return AdminOverviewStats(
        total_users=total_users,
        total_api_requests=total_logs,
        normal_events=normal_events,
        suspicious_events=suspicious_events,
        high_risk_events=high_risk_events,
        critical_events=critical_events,
        payment_events=payment_events,
        active_threats_count=active_threats_count,
        average_system_risk=0.18 if total_threats == 0 else min(round(0.2 + (total_threats / max(total_logs, 1)), 2), 0.95),
        gnn_status=gnn_engine.status,
        ml_status="TRAINED" if detector.is_fitted else "INITIALIZING",
        recent_threats=recent_threats_data,
        traffic_trend=traffic_trend,
        risk_distribution={
            "LOW": normal_events + low_risk,
            "MEDIUM": medium_risk,
            "HIGH": high_risk_events,
            "CRITICAL": critical_events,
        },
        top_anomalous_endpoints=top_endpoints,
    )


@router.get("/payments", response_model=PaymentSecurityStats)
def get_payment_security_stats(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    """
    Detailed payment security view fulfilling Section 32 requirements.
    """
    total_txns = db.query(func.count(Payment.id)).scalar() or 0
    verified_txns = db.query(func.count(Payment.id)).filter(Payment.status == "COMPLETED").scalar() or 0
    held_txns = db.query(func.count(Payment.id)).filter(Payment.status == "HELD").scalar() or 0
    flagged_txns = db.query(func.count(Payment.id)).filter(Payment.status == "VERIFICATION_REQUIRED").scalar() or 0
    pending_txns = db.query(func.count(Payment.id)).filter(Payment.status == "PENDING").scalar() or 0

    total_vol = db.query(func.sum(Payment.amount)).filter(Payment.status == "COMPLETED").scalar() or 0.0
    demo_vol = db.query(func.sum(Payment.amount)).filter(Payment.is_demo == True, Payment.status == "COMPLETED").scalar() or 0.0

    low_p = db.query(func.count(Payment.id)).filter(Payment.risk_level == "LOW").scalar() or 0
    med_p = db.query(func.count(Payment.id)).filter(Payment.risk_level == "MEDIUM").scalar() or 0
    high_p = db.query(func.count(Payment.id)).filter(Payment.risk_level == "HIGH").scalar() or 0
    crit_p = db.query(func.count(Payment.id)).filter(Payment.risk_level == "CRITICAL").scalar() or 0

    recent_pay_threats_records = db.query(Threat).filter(
        (Threat.event_type == "PAYMENT") | (Threat.endpoint.like("%/payment%"))
    ).order_by(Threat.created_at.desc()).limit(6).all()

    recent_threats_data = []
    for t in recent_pay_threats_records:
        exp_data = None
        if t.explanation:
            exp_data = ExplanationResponse(
                id=t.explanation.id,
                threat_id=t.explanation.threat_id,
                method=t.explanation.method,
                important_features=[FeatureAttribution(**f) for f in t.explanation.important_features],
                explanation=t.explanation.explanation,
                recommendation=t.explanation.recommendation,
                llm_model=t.explanation.llm_model,
                created_at=t.explanation.created_at,
            )
        recent_threats_data.append(
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
                explanation=exp_data,
            )
        )

    recent_payments = db.query(Payment).order_by(Payment.created_at.desc()).limit(15).all()
    recent_txns_data = [
        {
            "id": p.id,
            "user_id": p.user_id,
            "user_name": p.user.name if p.user else f"User {p.user_id}",
            "amount": p.amount,
            "currency": p.currency,
            "payment_method": p.payment_method,
            "status": p.status,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "transaction_reference": p.transaction_reference,
            "upi_id": p.upi_id or settings.UPI_ID,
            "is_demo": p.is_demo,
            "created_at": p.created_at.isoformat(),
        }
        for p in recent_payments
    ]

    return PaymentSecurityStats(
        total_transactions=total_txns,
        verified_count=verified_txns,
        pending_count=pending_txns,
        flagged_count=flagged_txns,
        held_count=held_txns,
        total_volume_inr=round(total_vol, 2),
        demo_volume_inr=round(demo_vol, 2),
        risk_distribution={
            "LOW": low_p,
            "MEDIUM": med_p,
            "HIGH": high_p,
            "CRITICAL": crit_p,
        },
        recent_threats=recent_threats_data,
        recent_transactions=recent_txns_data,
    )


@router.get("/graph", response_model=ApiFlowGraphResponse)
def get_api_flow_graph(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    graph_builder.build_flow_graph(db, limit=1500)
    data = graph_builder.to_dict()
    return ApiFlowGraphResponse(**data)


@router.get("/telemetry")
@router.get("/apis")
def get_telemetry_table(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    return logging_service.get_endpoint_telemetry(db)


@router.get("/settings")
def get_admin_settings(admin_user=Depends(require_admin)):
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "currency": settings.CURRENCY,
        "currency_symbol": settings.CURRENCY_SYMBOL,
        "upi_id": settings.UPI_ID,
        "payment_mode": settings.PAYMENT_MODE,
        "payment_provider": settings.PAYMENT_PROVIDER,
        "thresholds": {
            "medium": settings.RISK_THRESHOLD_MEDIUM,
            "high": settings.RISK_THRESHOLD_HIGH,
            "critical": settings.RISK_THRESHOLD_CRITICAL,
        },
        "ml": {
            "detector": "IsolationForest",
            "contamination": settings.ISOLATION_FOREST_CONTAMINATION,
            "is_fitted": detector.is_fitted,
        },
        "gnn": {
            "status": gnn_engine.status,
            "hidden_dim": settings.GNN_HIDDEN_DIM,
            "embedding_dim": settings.GNN_EMBEDDING_DIM,
        },
        "llm": {
            "model": settings.LLM_MODEL,
            "api_base": settings.LLM_API_BASE,
            "is_configured": bool(settings.LLM_API_KEY and len(settings.LLM_API_KEY) > 5),
        }
    }


@router.get("/users")
def list_users_for_admin(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    users = db.query(User).order_by(User.id.desc()).all()
    user_list = []
    for u in users:
        req_count = db.query(func.count(ApiLog.id)).filter(ApiLog.user_id == u.id).scalar() or 0
        threat_count = db.query(func.count(Threat.id)).filter(Threat.user_id == u.id).scalar() or 0
        pay_count = db.query(func.count(Payment.id)).filter(Payment.user_id == u.id).scalar() or 0

        risk_level = "LOW"
        if threat_count > 2:
            risk_level = "HIGH"
        elif threat_count > 0:
            risk_level = "MEDIUM"

        user_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
            "request_count": req_count,
            "threat_count": threat_count,
            "payment_count": pay_count,
            "risk_level": risk_level,
        })
    return user_list


@router.get("/users/{user_id}/investigate")
def investigate_user(user_id: int, db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    logs = db.query(ApiLog).filter(ApiLog.user_id == user.id).order_by(ApiLog.timestamp.desc()).limit(40).all()
    payments = db.query(Payment).filter(Payment.user_id == user.id).order_by(Payment.created_at.desc()).all()
    threats = db.query(Threat).filter(Threat.user_id == user.id).order_by(Threat.created_at.desc()).all()

    timeline = []
    for l in logs:
        timeline.append({
            "type": "API_LOG",
            "action": f"{l.method} {l.endpoint}",
            "status": l.status_code,
            "latency": l.response_time,
            "timestamp": l.timestamp.isoformat(),
            "is_error": l.status_code >= 400,
        })
    for p in payments:
        timeline.append({
            "type": "PAYMENT",
            "action": f"UPI Payment ₹{p.amount:,.2f} ({p.status})",
            "status": 200 if p.status == "COMPLETED" else 400,
            "latency": 110.0,
            "timestamp": p.created_at.isoformat(),
            "is_error": p.status != "COMPLETED",
        })
    for t in threats:
        timeline.append({
            "type": "THREAT_ALERT",
            "action": f"🚨 {t.threat_type} on {t.endpoint}",
            "status": 403,
            "latency": 0.0,
            "timestamp": t.created_at.isoformat(),
            "is_error": True,
        })

    timeline.sort(key=lambda x: x["timestamp"], reverse=True)

    risk_level = "LOW"
    if len(threats) >= 2:
        risk_level = "CRITICAL" if any(t.risk_level == "CRITICAL" for t in threats) else "HIGH"
    elif len(threats) == 1:
        risk_level = "MEDIUM"

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat(),
        },
        "total_requests": len(logs),
        "total_payments": len(payments),
        "total_threats": len(threats),
        "risk_level": risk_level,
        "average_risk_score": 0.15 if not threats else round(sum(t.anomaly_score for t in threats) / len(threats), 3),
        "recent_logs": [
            {
                "id": l.id,
                "endpoint": l.endpoint,
                "method": l.method,
                "status_code": l.status_code,
                "response_time": l.response_time,
                "timestamp": l.timestamp.isoformat(),
                "event_type": l.event_type,
            }
            for l in logs[:15]
        ],
        "timeline": timeline[:30],
    }


@router.get("/models/evaluate")
def evaluate_models(admin_user=Depends(require_admin)):
    return evaluator.run_evaluation()


@router.post("/models/train-gnn")
def trigger_gnn_training(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
    G = graph_builder.build_flow_graph(db, limit=2000)
    train_res = train_gnn_model(G, epochs=30, lr=0.01)
    gnn_engine._load_if_available()
    return {
        "message": "PyTorch GNN Anomaly Detector trained successfully on current API Flow Graph.",
        "details": train_res,
        "gnn_status": gnn_engine.status,
    }


@router.post("/simulate", response_model=SyntheticSimulationResponse)
def simulate_traffic_scenario(
    req: SyntheticSimulationRequest,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    result = demo_generator.run_scenario(
        db=db,
        scenario=req.scenario,
        target_user_email=req.target_user_email
    )
    return SyntheticSimulationResponse(**result)
