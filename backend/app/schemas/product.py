from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    brand: Optional[str] = "Generic"
    description: Optional[str] = None
    specifications: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    category: str = "Fashion"
    image_url: Optional[str] = None
    stock: int = 100
    rating: float = 4.5
    review_count: int = 12


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
