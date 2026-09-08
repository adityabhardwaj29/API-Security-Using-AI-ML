import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from backend.app.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    discount_type = Column(String(20), default="PERCENTAGE", nullable=False)  # 'PERCENTAGE' or 'FLAT'
    discount_value = Column(Float, nullable=False)  # e.g., 20 for 20%, 200 for ₹200 flat
    min_order_value = Column(Float, default=0.0, nullable=False)
    max_discount = Column(Float, nullable=True)  # Max discount cap for percentage
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
