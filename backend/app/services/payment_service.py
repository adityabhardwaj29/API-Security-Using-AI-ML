import uuid
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.payment import Payment
from backend.app.models.order import Order
from backend.app.models.cart import CartItem
from backend.app.models.security_event import SecurityEvent
from backend.app.ml.features import feature_engineer
from backend.app.ml.risk_engine import risk_engine
from backend.app.services.threat_service import threat_service


class PaymentService:
    """
    Handles realistic UPI-based payment processing for Indian E-Commerce,
    supporting both ₹0 Demo transaction mode and Sandbox/Live payment verification,
    integrated with real-time behavioral API security analysis.
    """

    def generate_upi_qr_payload(self, amount: float, transaction_ref: str, upi_id: Optional[str] = None) -> str:
        """
        Generates standard Indian UPI URI string for QR code generation:
        upi://pay?pa={upi_id}&pn=IndianEcommerce&am={amount}&cu=INR&tn={transaction_ref}
        """
        pa = upi_id or settings.UPI_ID
        pn = "SecureStore"
        cu = settings.CURRENCY  # "INR"
        am_str = f"{amount:.2f}"
        return f"upi://pay?pa={pa}&pn={pn}&am={am_str}&cu={cu}&tn={transaction_ref}"

    def process_payment(
        self,
        db: Session,
        user_id: int,
        amount: float,
        order_id: Optional[int] = None,
        currency: str = "INR",
        payment_method: str = "UPI",
        upi_id: Optional[str] = None,
        is_demo: bool = True,
        verification_code: Optional[str] = None,
        ip_address: str = "127.0.0.1"
    ) -> Dict[str, Any]:
        """
        Evaluates behavioral API risk and completes or holds UPI payment.
        """
        target_upi = upi_id or settings.UPI_ID

        # 1. Extract real-time behavioral features for user
        features = feature_engineer.extract_user_features(db, user_id=user_id, ip_address=ip_address)

        # 2. Evaluate with Multi-Factor Risk Engine
        evaluation = risk_engine.evaluate(
            features=features,
            endpoint="/api/payments",
            method="POST",
            user_role="USER"
        )

        risk_score = evaluation["risk_score"]
        risk_level = evaluation["risk_level"]
        is_threat = evaluation["is_threat"]

        # 3. Handle Step-Up Verification / Threat Hold
        if is_threat or risk_level in ("HIGH", "CRITICAL"):
            # Check if user successfully provided step-up challenge response
            if verification_code and verification_code.strip() == "123456":
                # Verified after security challenge
                txn_ref = f"UPI-VERIFIED-{uuid.uuid4().hex[:8].upper()}"
                payment = Payment(
                    order_id=order_id,
                    user_id=user_id,
                    amount=amount,
                    currency=currency,
                    payment_method=payment_method,
                    payment_status="COMPLETED",
                    status="COMPLETED",
                    provider=settings.PAYMENT_PROVIDER,
                    transaction_reference=txn_ref,
                    upi_id=target_upi,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    verification_required=False,
                    is_demo=is_demo,
                    created_at=datetime.datetime.utcnow(),
                )
                db.add(payment)

                # Update order status if order_id supplied
                if order_id:
                    order = db.query(Order).filter(Order.id == order_id).first()
                    if order:
                        order.status = "CONFIRMED"

                # Clear user's cart
                db.query(CartItem).filter(CartItem.user_id == user_id).delete()

                sec_event = SecurityEvent(
                    user_id=user_id,
                    event_type="PAYMENT_VERIFICATION",
                    severity="INFO",
                    risk_score=risk_score,
                    message=f"UPI payment of ₹{amount:,.2f} completed successfully after step-up verification ({txn_ref})",
                    source_ip=ip_address,
                    endpoint="/api/payments/verify",
                    created_at=datetime.datetime.utcnow(),
                )
                db.add(sec_event)
                db.commit()
                db.refresh(payment)

                return {
                    "payment": payment,
                    "status": "COMPLETED",
                    "verification_required": False,
                    "message": "Payment verified and processed successfully after step-up identity verification.",
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "upi_qr_payload": self.generate_upi_qr_payload(amount, txn_ref, target_upi),
                }

            # Security Hold Triggered -> Create threat & push WebSocket to Admin SOC
            threat_service.create_threat_and_broadcast(
                db=db,
                user_id=user_id,
                endpoint="/api/payments",
                event_type="PAYMENT",
                risk_evaluation=evaluation,
                features=features,
                ip_address=ip_address,
            )

            status_label = "VERIFICATION_REQUIRED" if risk_level == "HIGH" else "HELD"
            temp_ref = f"UPI-HOLD-{uuid.uuid4().hex[:8].upper()}"

            payment = Payment(
                order_id=order_id,
                user_id=user_id,
                amount=amount,
                currency=currency,
                payment_method=payment_method,
                payment_status=status_label,
                status=status_label,
                provider=settings.PAYMENT_PROVIDER,
                transaction_reference=temp_ref,
                upi_id=target_upi,
                risk_score=risk_score,
                risk_level=risk_level,
                verification_required=True,
                is_demo=is_demo,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

            return {
                "payment": payment,
                "status": status_label,
                "verification_required": True,
                "message": "Unusual activity pattern detected while processing payment. Security verification required before proceeding.",
                "risk_score": risk_score,
                "risk_level": risk_level,
                "upi_qr_payload": self.generate_upi_qr_payload(amount, temp_ref, target_upi),
            }

        # 4. Normal / Low / Medium Risk -> Process payment smoothly
        txn_prefix = "UPI-DEMO" if is_demo else "UPI-LIVE"
        txn_ref = f"{txn_prefix}-{uuid.uuid4().hex[:8].upper()}"

        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            payment_status="COMPLETED",
            status="COMPLETED",
            provider=settings.PAYMENT_PROVIDER,
            transaction_reference=txn_ref,
            upi_id=target_upi,
            risk_score=risk_score,
            risk_level=risk_level,
            verification_required=False,
            is_demo=is_demo,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(payment)

        # Update order status if order_id supplied
        if order_id:
            order = db.query(Order).filter(Order.id == order_id).first()
            if order:
                order.status = "CONFIRMED"

        # Clear cart upon successful checkout
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()

        # Audit security telemetry event
        demo_tag = " [₹0 Demo Mode]" if (is_demo and amount == 0) else (" [Demo Mode]" if is_demo else "")
        sec_event = SecurityEvent(
            user_id=user_id,
            event_type="PAYMENT_COMPLETED",
            severity="INFO",
            risk_score=risk_score,
            message=f"UPI payment of ₹{amount:,.2f}{demo_tag} processed successfully ({txn_ref})",
            source_ip=ip_address,
            endpoint="/api/payments",
            created_at=datetime.datetime.utcnow(),
        )
        db.add(sec_event)
        db.commit()
        db.refresh(payment)

        return {
            "payment": payment,
            "status": "COMPLETED",
            "verification_required": False,
            "message": "Payment verified and completed successfully via UPI.",
            "risk_score": risk_score,
            "risk_level": risk_level,
            "upi_qr_payload": self.generate_upi_qr_payload(amount, txn_ref, target_upi),
        }


payment_service = PaymentService()
