from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from backend.app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    quantity: int
    created_at: datetime
    product: Optional[ProductResponse] = None


class CartSummary(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    total_amount: float
    currency: str = "INR"
