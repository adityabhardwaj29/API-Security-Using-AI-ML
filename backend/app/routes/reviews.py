from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.product import Product
from backend.app.models.review import ProductReview
from backend.app.models.order import Order, OrderItem
from backend.app.schemas.review import ReviewCreate, ReviewResponse
from backend.app.security.permissions import require_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(ProductReview).filter(ProductReview.product_id == product_id).order_by(ProductReview.created_at.desc()).all()


@router.post("/product/{product_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_product_review(
    product_id: int,
    req: ReviewCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    # Check if user purchased product to mark as verified purchase
    purchased = db.query(OrderItem).join(Order).filter(
        Order.user_id == current_user.id,
        OrderItem.product_id == product_id
    ).first() is not None

    review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        user_name=current_user.name or "Verified Customer",
        rating=req.rating,
        title=req.title,
        comment=req.comment,
        is_verified_purchase=purchased,
        created_at=datetime.datetime.utcnow()
    )
    db.add(review)

    # Recalculate average rating
    all_reviews = db.query(ProductReview).filter(ProductReview.product_id == product_id).all()
    ratings = [r.rating for r in all_reviews] + [req.rating]
    prod.rating = round(sum(ratings) / len(ratings), 1)
    prod.review_count = len(ratings)

    db.commit()
    db.refresh(review)
    return review
