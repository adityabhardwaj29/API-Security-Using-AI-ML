from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.payment import Payment
from backend.app.schemas.payment import PaymentRequest, PaymentResponse
from backend.app.security.permissions import require_user
from backend.app.services.payment_service import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("", response_model=PaymentResponse)
@router.post("/create", response_model=PaymentResponse)
def create_payment(
    req: PaymentRequest,
    request: Request,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    ip = request.client.host if request.client else "127.0.0.1"

    result = payment_service.process_payment(
        db=db,
        user_id=current_user.id,
        amount=req.amount,
        order_id=req.order_id,
        currency=req.currency or settings.CURRENCY,
        payment_method=req.payment_method or "UPI",
        upi_id=req.upi_id or settings.UPI_ID,
        is_demo=req.is_demo,
        verification_code=req.verification_code,
        ip_address=ip
    )

    payment: Payment = result["payment"]

    return PaymentResponse(
        id=payment.id,
        user_id=payment.user_id,
        order_id=payment.order_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_status=payment.payment_status,
        payment_method=payment.payment_method,
        provider=payment.provider,
        risk_score=payment.risk_score,
        risk_level=payment.risk_level,
        verification_required=payment.verification_required,
        is_demo=payment.is_demo,
        transaction_reference=payment.transaction_reference,
        upi_id=payment.upi_id,
        upi_qr_payload=result.get("upi_qr_payload"),
        message=result["message"],
        created_at=payment.created_at,
    )


@router.post("/verify", response_model=PaymentResponse)
def verify_held_payment(
    req: PaymentRequest,
    request: Request,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    """
    Step-up security challenge verification endpoint.
    Accepts user MFA challenge token ('123456' in demo/sandbox).
    """
    ip = request.client.host if request.client else "127.0.0.1"

    result = payment_service.process_payment(
        db=db,
        user_id=current_user.id,
        amount=req.amount,
        order_id=req.order_id,
        currency=req.currency or settings.CURRENCY,
        payment_method=req.payment_method or "UPI",
        upi_id=req.upi_id or settings.UPI_ID,
        is_demo=req.is_demo,
        verification_code=req.verification_code,
        ip_address=ip
    )

    payment: Payment = result["payment"]

    return PaymentResponse(
        id=payment.id,
        user_id=payment.user_id,
        order_id=payment.order_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        payment_status=payment.payment_status,
        payment_method=payment.payment_method,
        provider=payment.provider,
        risk_score=payment.risk_score,
        risk_level=payment.risk_level,
        verification_required=payment.verification_required,
        is_demo=payment.is_demo,
        transaction_reference=payment.transaction_reference,
        upi_id=payment.upi_id,
        upi_qr_payload=result.get("upi_qr_payload"),
        message=result["message"],
        created_at=payment.created_at,
    )


@router.get("/history", response_model=List[PaymentResponse])
def get_payment_history(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).limit(50).all()

    return [
        PaymentResponse(
            id=p.id,
            user_id=p.user_id,
            order_id=p.order_id,
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            payment_status=p.payment_status,
            payment_method=p.payment_method,
            provider=p.provider,
            risk_score=p.risk_score,
            risk_level=p.risk_level,
            verification_required=p.verification_required,
            is_demo=p.is_demo,
            transaction_reference=p.transaction_reference,
            upi_id=p.upi_id,
            upi_qr_payload=payment_service.generate_upi_qr_payload(p.amount, p.transaction_reference or "REF", p.upi_id),
            message="Completed" if p.status == "COMPLETED" else "Security Verification Hold",
            created_at=p.created_at,
        )
        for p in payments
    ]


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment_by_id(
    payment_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    p = db.query(Payment).filter(Payment.id == payment_id, Payment.user_id == current_user.id).first()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    return PaymentResponse(
        id=p.id,
        user_id=p.user_id,
        order_id=p.order_id,
        amount=p.amount,
        currency=p.currency,
        status=p.status,
        payment_status=p.payment_status,
        payment_method=p.payment_method,
        provider=p.provider,
        risk_score=p.risk_score,
        risk_level=p.risk_level,
        verification_required=p.verification_required,
        is_demo=p.is_demo,
        transaction_reference=p.transaction_reference,
        upi_id=p.upi_id,
        upi_qr_payload=payment_service.generate_upi_qr_payload(p.amount, p.transaction_reference or "REF", p.upi_id),
        message="Completed" if p.status == "COMPLETED" else "Security Verification Hold",
        created_at=p.created_at,
    )
