from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.app.schemas.product import ProductResponse


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderCreateRequest(BaseModel):
    shipping_address: str
    coupon_code: Optional[str] = None
    discount: Optional[float] = 0.0


class OrderResponse(BaseModel):
    id: int
    user_id: int
    tracking_number: Optional[str] = None
    subtotal: float
    discount: float
    coupon_code: Optional[str] = None
    delivery_fee: float = 0.0
    final_amount: float
    currency: str
    status: str
    shipping_address: Optional[str] = None
    delivery_estimate: Optional[str] = "3-5 Business Days"
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
