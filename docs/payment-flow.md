# UPI Payment Architecture & Risk Pipeline

## 1. Indian Payment Standard (INR / UPI)
The platform standardizes on Indian Rupees (`₹`, `INR`) and Unified Payments Interface (UPI) flows.

### Dynamic UPI QR Specification
The dynamic QR payload generates compliant UPI payment URIs:
```
upi://pay?pa={UPI_ID}&pn=IndianStore&am={amount}&cu=INR&tn={order_ref}
```
Users can scan using any UPI-compliant application (Google Pay, PhonePe, Paytm, BHIM, Navi, CRED).

## 2. Safe ₹0 Demo Mode vs Sandbox Mode
- **Safe ₹0 Demo Mode**: Designed for demonstrations and safe evaluation. Displays clear badge: `Demo transaction — no real money transferred`. Allows testing all risk checks without financial overhead.
- **Sandbox Mode**: Simulates production UPI gateway callback verification challenges with simulated authorization responses.

## 3. Payment Verification & Security Step-Up Workflow
1. User confirms order checkout in Indian Rupees (`₹`).
2. Order record is created (`Order`, `OrderItem`).
3. Payment initiation requests `POST /api/payments`.
4. Feature engineering extracts the user's sliding-window behavioral features.
5. Multi-factor risk engine evaluates anomaly score:
   - **Low Risk (< 0.40)**: Auto-approved immediately.
   - **Medium Risk (0.40 - 0.70)**: Approved with SOC telemetry flagging.
   - **High Risk (0.70 - 0.88)**: Triggers user-friendly Security Verification Warning Modal (`⚠️ SECURITY CHECK REQUIRED: Step-up authentication needed`). User clicks `[ Verify Identity ]` or `[ Cancel Payment ]`.
   - **Critical Risk (>= 0.88)**: Payment held for SOC administrative review.
6. The user NEVER sees raw ML anomaly scores or internal security jargon.
