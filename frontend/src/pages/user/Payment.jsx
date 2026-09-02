import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  KeyRound,
  Info,
  XCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import { RiskBadge } from '../../components/Badge';

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Order & Amount details (in Indian Rupees ₹)
  const initialAmount = location.state?.amount ?? 899.0;
  const orderId = location.state?.orderId ?? null;
  const subtotal = location.state?.subtotal ?? (initialAmount + 100.0);
  const discount = location.state?.discount ?? 100.0;

  // Dual-mode: Demo Payment Mode vs Live/Sandbox
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [amount, setAmount] = useState(initialAmount);
  const [upiId, setUpiId] = useState('aadityabhardwaj5398@oksbi');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [paymentState, setPaymentState] = useState('IDLE'); // 'IDLE', 'ANALYZING', 'SUCCESS', 'HOLD'
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Step-up verification challenge state (Section 21)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync demo mode ₹0 toggling
  useEffect(() => {
    if (isDemoMode && amount === initialAmount && initialAmount > 0) {
      // Keep initial amount or allow ₹0 test
    }
  }, [isDemoMode, initialAmount]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleExecutePayment = async (customAmount = null) => {
    setPaymentState('ANALYZING');
    setErrorMessage('');
    const payAmt = customAmount !== null ? customAmount : amount;

    try {
      const res = await api.post('/payments', {
        amount: payAmt,
        order_id: orderId,
        currency: 'INR',
        payment_method: 'UPI',
        upi_id: upiId,
        is_demo: isDemoMode,
      });

      setPaymentResult(res.data);

      if (res.data.verification_required || res.data.status === 'VERIFICATION_REQUIRED' || res.data.status === 'HELD') {
        setPaymentState('HOLD');
        setIsVerificationModalOpen(true);
      } else {
        setPaymentState('SUCCESS');
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setPaymentState('IDLE');
      setErrorMessage(err.response?.data?.detail || 'Payment gateway connection failed. Please retry.');
    }
  };

  const handleVerifyChallenge = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.post('/payments/verify', {
        amount,
        order_id: orderId,
        currency: 'INR',
        payment_method: 'UPI',
        upi_id: upiId,
        is_demo: isDemoMode,
        verification_code: verificationCode,
      });

      setPaymentResult(res.data);
      if (res.data.status === 'COMPLETED') {
        setIsVerificationModalOpen(false);
        setPaymentState('SUCCESS');
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 },
        });
      } else {
        setErrorMessage('Invalid verification code. Please enter the sandbox demo token (123456).');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Step-up verification challenge failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelPayment = () => {
    setIsVerificationModalOpen(false);
    setPaymentState('IDLE');
    setErrorMessage('Payment cancelled by user after security alert.');
  };

  // Generate QR Canvas representation via standard SVG QR pattern
  const upiPayloadString = `upi://pay?pa=${upiId}&pn=SecureStore&am=${amount.toFixed(2)}&cu=INR&tn=ORD-${Date.now().toString().slice(-6)}`;

  return (
    <div className="main-content" style={{ maxWidth: '680px', padding: '2.5rem 1.5rem' }}>
      {/* User Security Warning Modal (Section 21) */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="⚠️ SECURITY CHECK REQUIRED"
        maxWidth="520px"
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(245, 158, 11, 0.18)',
            color: '#f59e0b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
          }}>
            <ShieldAlert size={36} />
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
            We Detected Unusual Activity
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto' }}>
            We detected unusual activity while processing your payment. For your protection, we need to verify your account before continuing.
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleVerifyChallenge}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Authentication Token</span>
              <span style={{ color: '#38bdf8', fontSize: '0.8rem' }}>Demo Sandbox Code: 123456</span>
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', letterSpacing: '0.25em', textAlign: 'center' }}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={handleCancelPayment}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.85rem' }}
            >
              Cancel Payment
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.85rem' }}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Identity'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          🔒 Telemetry incident recorded. Security operations center alerted via real-time WebSocket.
        </div>
      </Modal>

      {/* Main Payment Card */}
      <div className="card" style={{ padding: '2.25rem' }}>
        {/* Header with Indian Rupee Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              UPI Instant Checkout
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>Pay with UPI</h2>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            <button
              onClick={() => { setIsDemoMode(true); setAmount(initialAmount); }}
              style={{
                background: isDemoMode ? '#0066ff' : 'transparent',
                color: isDemoMode ? '#ffffff' : '#94a3b8',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              DEMO MODE
            </button>
            <button
              onClick={() => { setIsDemoMode(false); setAmount(initialAmount); }}
              style={{
                background: !isDemoMode ? '#0284c7' : 'transparent',
                color: !isDemoMode ? '#ffffff' : '#94a3b8',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}
            >
              SANDBOX
            </button>
          </div>
        </div>

        {paymentState === 'IDLE' && (
          <div>
            {errorMessage && (
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
              }}>
                {errorMessage}
              </div>
            )}

            {/* Mode Banner */}
            {isDemoMode && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#38bdf8',
                fontSize: '0.8125rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <Info size={18} />
                <span><strong>Demo transaction mode</strong> — Safe simulated payment with AI/ML security evaluation. No real money transferred.</span>
              </div>
            )}

            {/* Order Summary Box (Section 4) */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Order Summary
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.9rem', color: '#34d399' }}>
                <span>Discount</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                <span>Final Amount</span>
                <span style={{ color: '#38bdf8' }}>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Safe ₹0 Demo Test Option (Section 5) */}
            {isDemoMode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#34d399', fontSize: '0.9rem' }}>Test with ₹0 Demo Mode</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Safe demonstration of complete security workflow</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAmount(0)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      background: amount === 0 ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                    }}
                  >
                    Set ₹0
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount(initialAmount)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      background: amount === initialAmount ? '#0066ff' : 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                    }}
                  >
                    Set ₹{initialAmount}
                  </button>
                </div>
              </div>
            )}

            {/* Scan & Pay Card (Section 7) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              textAlign: 'center',
              marginBottom: '1.75rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#38bdf8', fontWeight: '700', fontSize: '0.9rem' }}>
                <QrCode size={20} />
                <span>Scan & Pay with Any UPI App</span>
              </div>

              {/* Dynamically Generated Genuine UPI QR Box */}
              <div style={{
                display: 'inline-block',
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                marginBottom: '1.25rem',
              }}>
                <QRCodeSVG
                  value={upiPayloadString}
                  size={190}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Mobile Deep-Link Option */}
              <div style={{ marginBottom: '1.25rem' }}>
                <a
                  href={upiPayloadString}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                >
                  <span>📱 Tap to Open in GPay / PhonePe / Paytm</span>
                </a>
              </div>

              {/* UPI ID Copy Block */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                maxWidth: '380px',
                margin: '0 auto',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>UPI ID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#ffffff', fontSize: '0.95rem' }}>
                    {upiId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="btn btn-sm btn-secondary"
                  style={{ marginLeft: 'auto' }}
                >
                  {copiedUpi ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Button: Verify & Complete Payment */}
            <button
              onClick={() => handleExecutePayment()}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              <Lock size={18} />
              <span>Verify & Complete UPI Payment (₹{amount.toLocaleString('en-IN')})</span>
            </button>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
              🔒 Evaluated in real-time by Multi-Factor Behavioral API Security & Graph Neural Network core.
            </div>
          </div>
        )}

        {paymentState === 'ANALYZING' && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <RefreshCw size={48} color="#38bdf8" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 1.5rem' }} />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
              Verifying Payment Security Telemetry
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', maxWidth: '440px', margin: '0 auto' }}>
              Inspecting API transition sequence, request velocity, and risk parameters against behavioral models...
            </p>
          </div>
        )}

        {paymentState === 'SUCCESS' && paymentResult && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
            }}>
              <CheckCircle2 size={44} />
            </div>

            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
              Payment Verified!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
              {paymentResult.message}
            </p>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.35rem',
              textAlign: 'left',
              marginBottom: '2rem',
              fontSize: '0.9rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>Transaction Reference:</span>
                <span style={{ color: '#ffffff', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                  {paymentResult.transaction_reference}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>Amount Paid:</span>
                <span style={{ color: '#38bdf8', fontWeight: '800' }}>₹{paymentResult.amount?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>Payment Method:</span>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>UPI ({paymentResult.upi_id || 'aadityabhardwaj5398@oksbi'})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Security Assessment:</span>
                <RiskBadge level={paymentResult.risk_level} score={paymentResult.risk_score} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/products" className="btn btn-secondary" style={{ flex: 1 }}>
                Continue Shopping
              </Link>
              <Link to="/transactions" className="btn btn-primary" style={{ flex: 1 }}>
                View Transactions
              </Link>
            </div>
          </div>
        )}

        {paymentState === 'HOLD' && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(244, 63, 94, 0.18)',
              color: '#f43f5e',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 0 25px rgba(244, 63, 94, 0.3)',
            }}>
              <ShieldAlert size={44} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
              Security Hold Placed
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.75rem', maxWidth: '440px', margin: '0 auto 1.75rem' }}>
              Unusual behavioral activity was detected during this payment attempt. Identity verification is required.
            </p>

            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              Verify Identity with Step-Up Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
