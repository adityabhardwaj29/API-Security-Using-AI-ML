from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class PaymentRequest(BaseModel):
    amount: float = Field(..., ge=0)  # ge=0 supports ₹0 safe demo payments
    order_id: Optional[int] = None
    currency: str = "INR"
    payment_method: str = "UPI"  # 'UPI', 'UPI_QR', 'DEMO_TEST'
    upi_id: Optional[str] = None
    is_demo: bool = True
    verification_code: Optional[str] = None  # Step-up verification challenge code (123456)


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    order_id: Optional[int] = None
    amount: float
    currency: str
    status: str  # 'COMPLETED', 'HELD', 'VERIFICATION_REQUIRED', 'FAILED'
    payment_status: Optional[str] = "COMPLETED"
    payment_method: str
    provider: Optional[str] = "UPI_SANDBOX"
    provider_transaction_id: Optional[str] = None
    provider_reference: Optional[str] = None
    verification_status: Optional[str] = "verified"
    verification_source: Optional[str] = "demo"
    initiated_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    risk_score: float
    risk_level: str
    verification_required: bool
    is_demo: Optional[bool] = True
    transaction_reference: Optional[str] = None
    upi_id: Optional[str] = None
    upi_qr_payload: Optional[str] = None
    message: str
    created_at: datetime


class PaymentWebhookRequest(BaseModel):
    provider_transaction_id: str
    order_id: Optional[int] = None
    payment_id: Optional[int] = None
    amount: float
    currency: str = "INR"
    status: str = "SUCCESS"  # 'SUCCESS', 'FAILED', 'CANCELLED'
    signature: Optional[str] = None
    upi_id: Optional[str] = None
    user_id: Optional[int] = None
    metadata: Optional[str] = None

