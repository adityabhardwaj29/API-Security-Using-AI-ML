from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    title: Optional[str] = None
    comment: str


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: str
    rating: float
    title: Optional[str] = None
    comment: str
    is_verified_purchase: bool
    created_at: datetime

    class Config:
        from_attributes = True
