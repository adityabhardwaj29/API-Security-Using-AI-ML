import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)  # in INR (₹)
    category = Column(String(100), default="Fashion", index=True, nullable=False)
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, default=100, nullable=False)
    rating = Column(Float, default=4.5, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
