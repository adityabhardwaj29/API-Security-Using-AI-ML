from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.wishlist import WishlistItem
from backend.app.models.cart import CartItem
from backend.app.models.product import Product
from backend.app.schemas.wishlist import WishlistItemCreate, WishlistItemResponse
from backend.app.security.permissions import require_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[WishlistItemResponse])
def get_wishlist(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    return db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).order_by(WishlistItem.created_at.desc()).all()


@router.post("", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    req: WishlistItemCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == req.product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == req.product_id
    ).first()

    if existing:
        return existing

    item = WishlistItem(user_id=current_user.id, product_id=req.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist.")

    db.delete(item)
    db.commit()
    return {"message": "Product removed from wishlist.", "product_id": product_id}


@router.post("/move-to-cart/{product_id}", status_code=status.HTTP_200_OK)
def move_wishlist_to_cart(
    product_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    wish_item = db.query(WishlistItem).filter(
        WishlistItem.user_id == current_user.id,
        WishlistItem.product_id == product_id
    ).first()

    if not wish_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist.")

    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product no longer exists.")

    # Add to cart
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id
    ).first()

    if cart_item:
        cart_item.quantity += 1
    else:
        new_cart = CartItem(user_id=current_user.id, product_id=product_id, quantity=1)
        db.add(new_cart)

    db.delete(wish_item)
    db.commit()
    return {"message": "Product moved to cart successfully."}
