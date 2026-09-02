from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from backend.app.schemas.user import UserResponse


class FeatureAttribution(BaseModel):
    feature: str
    observed_value: float
    importance: float
    importance_level: str
    direction: str
    description: Optional[str] = ""


class ExplanationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    threat_id: int
    method: str
    important_features: List[FeatureAttribution]
    explanation: str
    recommendation: str
    llm_model: str
    created_at: datetime


class ThreatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    endpoint: str
    event_type: str
    threat_type: str
    anomaly_score: float
    confidence: float
    risk_level: str
    status: str
    action_taken: str
    details: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None
    explanation: Optional[ExplanationResponse] = None


class ThreatActionRequest(BaseModel):
    action: str = Field(..., description="'ACKNOWLEDGE', 'MITIGATE', 'FALSE_POSITIVE'")
    notes: Optional[str] = None
