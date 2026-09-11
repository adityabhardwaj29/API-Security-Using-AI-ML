from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Any, Optional
from datetime import datetime
from backend.app.schemas.threat import ThreatResponse, FeatureAttribution


class TrafficTrendPoint(BaseModel):
    time: str
    requests: int
    errors: int
    payments: int


class EndpointTelemetry(BaseModel):
    endpoint: str
    method: str
    total_calls: int
    error_count: int
    error_rate: float
    avg_latency_ms: float
    p95_latency_ms: float
    unique_users_count: int
    anomalous_events_count: int


class PaymentSecurityStats(BaseModel):
    total_transactions: int
    verified_count: int
    pending_count: int
    flagged_count: int
    held_count: int
    total_volume_inr: float
    demo_volume_inr: float
    risk_distribution: Dict[str, int]
    recent_threats: List[ThreatResponse]
    recent_transactions: List[Dict[str, Any]]


class AdminOverviewStats(BaseModel):
    total_users: int
    new_users_today: int = 0
    total_api_requests: int
    normal_events: int
    suspicious_events: int
    high_risk_events: int
    critical_events: int
    payment_events: int
    successful_payments: int = 0
    pending_payments: int = 0
    failed_payments: int = 0
    payment_security_alerts: int = 0
    active_threats_count: int
    average_system_risk: float
    gnn_status: str
    ml_status: str
    recent_threats: List[ThreatResponse]
    recent_registrations: List[Dict[str, Any]] = []
    traffic_trend: List[TrafficTrendPoint]
    risk_distribution: Dict[str, int]
    top_anomalous_endpoints: List[EndpointTelemetry]



class ModelEvaluationResult(BaseModel):
    baseline_rule_f1: float
    isolation_forest_f1: float
    gnn_f1: float
    isolation_forest_auc: float
    gnn_auc: float
    sample_size: int
    evaluation_timestamp: str


class SyntheticSimulationRequest(BaseModel):
    scenario: str = Field(..., description="'NORMAL_PURCHASE', 'PAYMENT_BURST', 'UNUSUAL_TRANSITION', 'BRUTE_FORCE_LOGIN', 'ADMIN_PROBE'")
    target_user_email: Optional[str] = "user@apisecurity.io"


class SyntheticSimulationResponse(BaseModel):
    scenario: str
    events_generated: int
    threat_detected: bool
    risk_level: str
    risk_score: float
    threat_type: Optional[str] = None
    action_taken: str
    summary: str
