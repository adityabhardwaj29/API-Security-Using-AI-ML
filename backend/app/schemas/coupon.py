from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CouponValidateRequest(BaseModel):
    code: str
    cart_total: float


class CouponResponse(BaseModel):
    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_order_value: float
    max_discount: Optional[float] = None
    is_active: bool
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CouponValidationResult(BaseModel):
    valid: bool
    code: str
    discount_amount: float
    message: str
