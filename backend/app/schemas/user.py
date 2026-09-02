from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from backend.app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

UserCreate = RegisterRequest
UserLogin = LoginRequest


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserInvestigationResponse(BaseModel):
    user: UserResponse
    total_requests: int
    total_payments: int
    total_threats: int
    risk_level: str
    average_risk_score: float
    recent_logs: List[dict]
    timeline: List[dict]

    model_config = ConfigDict(from_attributes=True)
