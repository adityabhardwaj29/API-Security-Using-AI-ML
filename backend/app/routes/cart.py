from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.cart import CartItem
from backend.app.models.product import Product
from backend.app.schemas.cart import CartItemCreate, CartItemResponse, CartSummary
from backend.app.security.permissions import require_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartSummary)
def get_cart(current_user: User = Depends(require_user), db: Session = Depends(get_db)):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    total_amount = sum(item.product.price * item.quantity for item in items if item.product)
    total_count = sum(item.quantity for item in items)
    return CartSummary(
        items=items,
        total_items=total_count,
        total_amount=round(total_amount, 2),
        currency="INR",
    )


@router.post("", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    req: CartItemCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == req.product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == req.product_id
    ).first()

    if existing_item:
        existing_item.quantity += req.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        new_item = CartItem(
            user_id=current_user.id,
            product_id=req.product_id,
            quantity=req.quantity
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item


@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    quantity: int = Body(..., embed=True, ge=1),
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    item.quantity = quantity
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart.", "deleted_id": item_id}


@router.delete("", status_code=status.HTTP_200_OK)
def clear_cart(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared."}
