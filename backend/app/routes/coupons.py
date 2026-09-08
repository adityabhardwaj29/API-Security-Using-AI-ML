from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from backend.app.database import get_db
from backend.app.models.coupon import Coupon
from backend.app.schemas.coupon import CouponResponse, CouponValidateRequest, CouponValidationResult

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.get("", response_model=List[CouponResponse])
def list_active_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).filter(Coupon.is_active == True).all()


@router.post("/validate", response_model=CouponValidationResult)
def validate_coupon(req: CouponValidateRequest, db: Session = Depends(get_db)):
    code_clean = req.code.strip().upper()
    coupon = db.query(Coupon).filter(Coupon.code == code_clean, Coupon.is_active == True).first()

    if not coupon:
        return CouponValidationResult(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            message="Invalid or expired coupon code."
        )

    if coupon.expires_at and coupon.expires_at < datetime.datetime.utcnow():
        return CouponValidationResult(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            message="Coupon has expired."
        )

    if req.cart_total < coupon.min_order_value:
        return CouponValidationResult(
            valid=False,
            code=code_clean,
            discount_amount=0.0,
            message=f"Minimum order value of ₹{coupon.min_order_value:,.0f} required for this coupon."
        )

    discount = 0.0
    if coupon.discount_type == "PERCENTAGE":
        discount = (coupon.discount_value / 100.0) * req.cart_total
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    else:  # FLAT
        discount = min(coupon.discount_value, req.cart_total)

    return CouponValidationResult(
        valid=True,
        code=code_clean,
        discount_amount=round(discount, 2),
        message=f"Coupon applied! You saved ₹{discount:,.2f}"
    )
