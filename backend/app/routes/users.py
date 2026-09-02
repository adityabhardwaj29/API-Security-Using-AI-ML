from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.security_event import SecurityEvent
from backend.app.schemas.user import UserResponse
from backend.app.security.permissions import require_user
from backend.app.ml.features import feature_engineer
from backend.app.ml.risk_engine import risk_engine

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(require_user)):
    return current_user


@router.get("/security-status")
def get_user_security_status(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Returns user-facing security status without exposing internal threat signatures.
    """
    features = feature_engineer.extract_user_features(db, user_id=current_user.id)
    evaluation = risk_engine.evaluate(features, "/api/users/profile", "GET", current_user.role)

    recent_events = db.query(SecurityEvent).filter(
        SecurityEvent.user_id == current_user.id
    ).order_by(SecurityEvent.created_at.desc()).limit(5).all()

    return {
        "status": "HEALTHY" if evaluation["risk_level"] in ("LOW", "MEDIUM") else "ATTENTION_REQUIRED",
        "account_standing": "Good Standing",
        "mfa_enabled": True,
        "last_login_verified": True,
        "recent_activity_count": features.get("request_count", 0),
        "recent_security_events": [
            {
                "event_type": e.event_type,
                "message": e.message,
                "timestamp": e.created_at.isoformat(),
            }
            for e in recent_events
        ]
    }
