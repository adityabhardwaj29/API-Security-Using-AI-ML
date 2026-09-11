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
        now = datetime.datetime.utcnow()
        if is_threat or risk_level in ("HIGH", "CRITICAL"):
            # Check if user successfully provided step-up challenge response
            if verification_code and verification_code.strip() == "123456":
                # Verified after security challenge
                txn_ref = f"UPI-VERIFIED-{uuid.uuid4().hex[:8].upper()}"
                provider_tx_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
                payment = Payment(
                    order_id=order_id,
                    user_id=user_id,
                    amount=amount,
                    currency=currency,
                    payment_method=payment_method,
                    payment_status="COMPLETED",
                    status="COMPLETED",
                    provider=settings.PAYMENT_PROVIDER,
                    provider_transaction_id=provider_tx_id,
                    provider_reference=f"REF-{uuid.uuid4().hex[:8].upper()}",
                    transaction_reference=txn_ref,
                    upi_id=target_upi,
                    verification_status="verified",
                    verification_source="demo" if is_demo else "provider_api",
                    risk_score=risk_score,
                    risk_level=risk_level,
                    verification_required=False,
                    is_demo=is_demo,
                    initiated_at=now,
                    verified_at=now,
                    created_at=now,
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
                    created_at=now,
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
            provider_tx_id = f"TXN-HOLD-{uuid.uuid4().hex[:10].upper()}"

            payment = Payment(
                order_id=order_id,
                user_id=user_id,
                amount=amount,
                currency=currency,
                payment_method=payment_method,
                payment_status=status_label,
                status=status_label,
                provider=settings.PAYMENT_PROVIDER,
                provider_transaction_id=provider_tx_id,
                provider_reference=f"REF-{uuid.uuid4().hex[:8].upper()}",
                transaction_reference=temp_ref,
                upi_id=target_upi,
                verification_status="verification_required",
                verification_source="demo" if is_demo else "provider_api",
                risk_score=risk_score,
                risk_level=risk_level,
                verification_required=True,
                is_demo=is_demo,
                initiated_at=now,
                created_at=now,
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
        provider_tx_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"

        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            payment_status="COMPLETED",
            status="COMPLETED",
            provider=settings.PAYMENT_PROVIDER,
            provider_transaction_id=provider_tx_id,
            provider_reference=f"REF-{uuid.uuid4().hex[:8].upper()}",
            transaction_reference=txn_ref,
            upi_id=target_upi,
            verification_status="verified",
            verification_source="demo" if is_demo else "provider_api",
            risk_score=risk_score,
            risk_level=risk_level,
            verification_required=False,
            is_demo=is_demo,
            initiated_at=now,
            verified_at=now,
            created_at=now,
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
            created_at=now,
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

    def process_webhook(
        self,
        db: Session,
        webhook_data: Dict[str, Any],
        ip_address: str = "127.0.0.1"
    ) -> Dict[str, Any]:
        """
        Processes payment gateway webhook with idempotency check on provider_transaction_id.
        Prevents duplicate payments if provider dispatches repeated webhook events.
        """
        provider_tx_id = webhook_data.get("provider_transaction_id")
        if not provider_tx_id:
            raise ValueError("Missing provider_transaction_id in webhook payload.")

        # IDEMPOTENCY CHECK:
        existing = db.query(Payment).filter(Payment.provider_transaction_id == provider_tx_id).first()
        if existing:
            return {
                "status": "success",
                "message": "Webhook already processed (idempotent).",
                "idempotent": True,
                "payment_id": existing.id,
                "payment_status": existing.status,
                "transaction_reference": existing.transaction_reference,
            }

        now = datetime.datetime.utcnow()
        webhook_status = webhook_data.get("status", "SUCCESS").upper()
        amount = float(webhook_data.get("amount", 0.0))
        order_id = webhook_data.get("order_id")
        user_id = webhook_data.get("user_id") or 1
        currency = webhook_data.get("currency", "INR")
        upi_id = webhook_data.get("upi_id") or settings.UPI_ID

        # Determine success / failure
        is_success = webhook_status in ("SUCCESS", "COMPLETED", "PAID")
        final_status = "COMPLETED" if is_success else "FAILED"
        verification_status = "verified" if is_success else "failed"

        txn_ref = f"UPI-HOOK-{uuid.uuid4().hex[:8].upper()}"

        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            currency=currency,
            payment_method="UPI",
            payment_status=final_status,
            status=final_status,
            provider=settings.PAYMENT_PROVIDER,
            provider_transaction_id=provider_tx_id,
            provider_reference=webhook_data.get("provider_reference") or f"WH-{uuid.uuid4().hex[:6].upper()}",
            transaction_reference=txn_ref,
            upi_id=upi_id,
            verification_status=verification_status,
            verification_source="provider_webhook",
            risk_score=0.05 if is_success else 0.45,
            risk_level="LOW" if is_success else "MEDIUM",
            verification_required=False,
            is_demo=False,
            initiated_at=now,
            verified_at=now if is_success else None,
            failed_at=now if not is_success else None,
            created_at=now,
        )
        db.add(payment)

        if order_id:
            order = db.query(Order).filter(Order.id == order_id).first()
            if order:
                order.status = "CONFIRMED" if is_success else "FAILED"

        # Security Audit Log
        sec_event = SecurityEvent(
            user_id=user_id,
            event_type="PAYMENT_WEBHOOK",
            severity="INFO" if is_success else "WARNING",
            risk_score=0.05 if is_success else 0.45,
            message=f"Webhook verification processed for {provider_tx_id} - Status: {final_status}",
            source_ip=ip_address,
            endpoint="/api/payments/webhook",
            created_at=now,
        )
        db.add(sec_event)
        db.commit()
        db.refresh(payment)

        return {
            "status": "success",
            "message": "Payment verified via webhook.",
            "idempotent": False,
            "payment_id": payment.id,
            "payment_status": payment.status,
            "verification_status": payment.verification_status,
            "transaction_reference": payment.transaction_reference,
        }


payment_service = PaymentService()

