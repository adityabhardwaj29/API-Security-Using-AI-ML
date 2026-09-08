import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    brand = Column(String(100), default="Generic", nullable=False)
    description = Column(Text, nullable=True)
    specifications = Column(Text, nullable=True)  # JSON or key-value string
    price = Column(Float, nullable=False)  # in INR (₹)
    original_price = Column(Float, nullable=True)  # MRP before discount
    category = Column(String(100), default="Fashion", index=True, nullable=False)
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, default=100, nullable=False)
    rating = Column(Float, default=4.5, nullable=False)
    review_count = Column(Integer, default=12, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")
