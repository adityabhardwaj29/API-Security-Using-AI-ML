import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from backend.app.database import Base


class FeatureSnapshot(Base):
    __tablename__ = "feature_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)
    features_json = Column(JSON, nullable=False)
    anomaly_score = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(20), default="LOW", nullable=False)


class GraphEvent(Base):
    __tablename__ = "graph_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    source_node = Column(String(255), nullable=False)
    target_node = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)
    is_anomalous = Column(Boolean, default=False, nullable=False)
