import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.order import Order, OrderItem
from backend.app.models.cart import CartItem
from backend.app.models.product import Product
from backend.app.schemas.order import OrderCreateRequest, OrderResponse, OrderItemResponse
from backend.app.security.permissions import require_user

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    req: OrderCreateRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty. Add products before placing order.")

    subtotal = sum(item.product.price * item.quantity for item in cart_items if item.product)
    discount = req.discount if req.discount < subtotal else 0.0
    final_amount = max(subtotal - discount, 0.0)

    order = Order(
        user_id=current_user.id,
        subtotal=round(subtotal, 2),
        discount=round(discount, 2),
        final_amount=round(final_amount, 2),
        currency="INR",
        status="PENDING",
        shipping_address=req.shipping_address,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        if item.product:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.product.price,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(order_item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order
