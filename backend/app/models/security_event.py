import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    event_type = Column(String(50), index=True, nullable=False)  # 'AUTH', 'PAYMENT', 'ADMIN_PROBE', 'RATE_ANOMALY'
    severity = Column(String(20), index=True, nullable=False)  # 'INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    risk_score = Column(Float, default=0.0, nullable=False)
    message = Column(Text, nullable=False)
    source_ip = Column(String(50), nullable=True)
    endpoint = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)

    user = relationship("User", back_populates="security_events")
