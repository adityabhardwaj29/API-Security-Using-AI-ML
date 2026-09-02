import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from backend.app.database import Base


class ApiLog(Base):
    __tablename__ = "api_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    endpoint = Column(String(255), index=True, nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)
    response_time = Column(Float, nullable=False)  # in milliseconds
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_size = Column(Integer, default=0, nullable=False)  # in bytes
    event_type = Column(String(50), index=True, nullable=False)  # e.g., 'AUTH', 'PAYMENT', 'READ', 'WRITE', 'ADMIN'

    __table_args__ = (
        Index("idx_api_logs_user_timestamp", "user_id", "timestamp"),
        Index("idx_api_logs_endpoint_timestamp", "endpoint", "timestamp"),
    )
