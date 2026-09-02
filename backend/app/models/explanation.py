import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class ThreatExplanation(Base):
    __tablename__ = "explanations"

    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    method = Column(String(50), default="SHAP", nullable=False)  # 'SHAP' or 'FALLBACK_FEATURE_IMPORTANCE'
    important_features = Column(JSON, nullable=False)  # list of {feature, value, importance, direction}
    explanation = Column(Text, nullable=False)  # LLM or deterministic fallback summary
    recommendation = Column(Text, nullable=False)  # actionable security mitigation advice
    llm_model = Column(String(50), default="deterministic_fallback", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    threat = relationship("Threat", back_populates="explanation")
