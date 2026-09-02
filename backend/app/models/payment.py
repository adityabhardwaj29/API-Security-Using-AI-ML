import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    payment_method = Column(String(50), default="UPI", nullable=False)  # 'UPI', 'UPI_QR', 'DEMO_TEST'
    payment_status = Column(String(30), default="COMPLETED", nullable=False)  # 'COMPLETED', 'HELD', 'VERIFICATION_REQUIRED', 'REJECTED'
    status = Column(String(30), default="COMPLETED", nullable=False)  # Alias for backward compatibility
    provider = Column(String(50), default="UPI_SANDBOX", nullable=False)
    transaction_reference = Column(String(100), nullable=True)
    upi_id = Column(String(100), nullable=True)
    risk_score = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(20), default="LOW", nullable=False)  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    verification_required = Column(Boolean, default=False, nullable=False)
    is_demo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True, nullable=False)

    user = relationship("User", back_populates="payments")
    order = relationship("Order", back_populates="payments")
