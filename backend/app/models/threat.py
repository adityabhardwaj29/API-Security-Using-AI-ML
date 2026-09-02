import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    endpoint = Column(String(255), index=True, nullable=False)
    event_type = Column(String(50), index=True, nullable=False)
    threat_type = Column(String(100), nullable=False)  # e.g., 'HIGH_RATE_PAYMENT_ANOMALY', 'UNUSUAL_API_TRANSITION', 'BRUTE_FORCE_LOGIN'
    anomaly_score = Column(Float, nullable=False)
    confidence = Column(Float, default=0.85, nullable=False)
    risk_level = Column(String(20), index=True, nullable=False)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status = Column(String(30), default="ACTIVE", index=True, nullable=False)  # 'ACTIVE', 'ACKNOWLEDGED', 'MITIGATED', 'FALSE_POSITIVE'
    action_taken = Column(String(100), default="ALERT_ADMIN", nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)

    user = relationship("User", back_populates="threats")
    explanation = relationship("ThreatExplanation", back_populates="threat", uselist=False, cascade="all, delete-orphan")
