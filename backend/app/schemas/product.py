from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    stock: int
    rating: float = 4.5
    created_at: datetime


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str = "Fashion"
    image_url: Optional[str] = None
    stock: int = Field(100, ge=0)
    rating: float = Field(4.5, ge=1.0, le=5.0)
