from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from backend.app.schemas.product import ProductResponse


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None
    created_at: datetime


class OrderCreateRequest(BaseModel):
    shipping_address: Optional[str] = "123 MG Road, Bengaluru, Karnataka, India"
    discount: float = 0.0


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subtotal: float
    discount: float
    final_amount: float
    currency: str = "INR"
    status: str
    shipping_address: Optional[str] = None
    items: List[OrderItemResponse] = []
    created_at: datetime
