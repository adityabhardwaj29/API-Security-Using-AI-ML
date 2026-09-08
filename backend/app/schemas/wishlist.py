from pydantic import BaseModel
from datetime import datetime
from backend.app.schemas.product import ProductResponse


class WishlistItemCreate(BaseModel):
    product_id: int


class WishlistItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: ProductResponse
    created_at: datetime

    class Config:
        from_attributes = True
