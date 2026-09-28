import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ThemeToggle from '../../components/ThemeToggle';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import {
  CreditCard, ShieldCheck, CheckCircle2, ArrowLeft,
  Lock, Check, AlertCircle, FileText, Download,
  Play, GraduationCap, Clock, Award, ChevronRight,
  Smartphone, QrCode, Building2, Globe
} from 'lucide-react';

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    courses, currentUser, processEnrollmentPayment,
    getEnrollment, getInvoiceById
  } = useLms();

  const course = courses.find(c => c.id === courseId || c.slug === courseId);

  // Gateway selection: 'stripe' | 'paypal' | 'razorpay' | 'local'
  const [selectedGateway, setSelectedGateway] = useState('stripe');

  // Stripe Card form
  const [cardName, setCardName] = useState(currentUser?.name || 'Ava Thompson');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('94025');

  // Razorpay form
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Local Gateway form
  const [localMethod, setLocalMethod] = useState('bKash'); // 'bKash' | 'Nagad' | 'Rocket' | 'Bank Wire'
  const [localPhone, setLocalPhone] = useState('01712345678');
  const [localTxnId, setLocalTxnId] = useState('');

  // Checkout Processing & Completion
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Course not found.</p>
      </div>
    );
  }

  // Calculate pricing
  const originalPrice = course.price || 0;
  const finalPrice = originalPrice;

  const handleQuickFillCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvc('884');
    setCardZip('94025');
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const result = processEnrollmentPayment({
        courseId: course.id,
        gateway: selectedGateway,
        couponCode: null,
        paymentDetails: {
          cardName,
          gateway: selectedGateway,
          localTxnId: localTxnId || 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        }
      });

      setIsProcessing(false);
      if (result.success) {
        setPaymentResult(result);
        const inv = getInvoiceById(result.invoiceId);
        setActiveInvoice(inv);
      } else {
        alert(result.message || 'Payment could not be completed.');
      }
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Top Header */}
      <header style={{
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: 'var(--border-subtle)', background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--cyan), #17283b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <GraduationCap size={20} />
          </div>
          <Link to={`/course/${course.slug}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back to Course
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--emerald)', fontWeight: 600 }}>
            <ShieldCheck size={16} /> 256-Bit SSL Encrypted Checkout
          </div>
          <ThemeToggle size="sm" />
        </div>
      </header>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 24px' }}>
        {paymentResult ? (
          /* SUCCESS STATE */
          <div style={{
            background: 'var(--glass-surface-light)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 32px',
            textAlign: 'center',
            maxWidth: 640,
            margin: '0 auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={44} />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
              Enrollment Confirmed & Active!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 460, margin: '0 auto 24px' }}>
              Congratulations! Your payment of <strong>${paymentResult.finalAmount.toFixed(2)}</strong> via {selectedGateway.toUpperCase()} was successful. You now have full lifetime access.
            </p>

            {/* Receipt Summary Card */}
            <div style={{
              background: 'var(--glass-surface)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border-subtle)',
              padding: '18px 24px',
              textAlign: 'left',
              marginBottom: 28
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Course:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Invoice Number:</span>
                <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>{paymentResult.invoiceNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{paymentResult.transactionId}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>✓ Completed & Verified</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowInvoiceModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <FileText size={16} /> View / Print Tax Invoice
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate(`/student/learn/${course.id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 15 }}
              >
                <Play size={16} /> Start Learning Now
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 32 }}>
            {/* Left: Payment Method Selection */}
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                Select Payment Method
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                Choose your preferred payment gateway to activate instant course access
              </p>

              {/* Gateway Tabs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                marginBottom: 24
              }}>
                {[
                  { id: 'stripe', name: 'Credit Card', sub: 'Stripe', icon: CreditCard },
                  { id: 'paypal', name: 'PayPal', sub: 'Instant', icon: Globe },
                  { id: 'razorpay', name: 'Razorpay', sub: 'UPI / NetBanking', icon: QrCode },
                  { id: 'local', name: 'Local Pay', sub: 'bKash / Bank', icon: Smartphone },
                ].map(gw => (
                  <button
                    type="button"
                    key={gw.id}
                    onClick={() => setSelectedGateway(gw.id)}
                    style={{
                      padding: '14px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: selectedGateway === gw.id ? 'var(--glass-surface-hover)' : 'var(--glass-surface)',
                      border: selectedGateway === gw.id ? '2px solid var(--cyan)' : 'var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      color: selectedGateway === gw.id ? 'var(--cyan)' : 'var(--text-secondary)'
                    }}
                  >
                    <gw.icon size={22} style={{ margin: '0 auto 6px', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{gw.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{gw.sub}</div>
                  </button>
                ))}
              </div>

              {/* Gateway Tab Content */}
              <div style={{
                background: 'var(--glass-surface-light)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px'
              }}>
                {/* 1. STRIPE CARD FORM */}
                {selectedGateway === 'stripe' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Credit or Debit Card
                      </span>
                      <button
                        type="button"
                        onClick={handleQuickFillCard}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, color: 'var(--cyan)' }}
                      >
                        ⚡ Fill Demo Card
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          Card Number
                        </label>
                        <div className="input-with-icon">
                          <CreditCard className="input-icon" size={16} />
                          <input
                            type="text"
                            className="input"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4242 •••• •••• 4242"
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            Expiry
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM / YY"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            CVC / CVV
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            Postal Code
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={cardZip}
                            onChange={(e) => setCardZip(e.target.value)}
                            placeholder="94025"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PAYPAL */}
                {selectedGateway === 'paypal' && (
                  <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: '50%', background: 'rgba(0, 112, 186, 0.15)',
                      color: '#0070ba', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      <Globe size={28} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>PayPal One-Touch Checkout</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto 18px' }}>
                      Connect your PayPal account or pay with debit/credit card securely with buyer protection.
                    </p>
                    <div style={{ padding: 12, background: 'rgba(0, 112, 186, 0.08)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      Connected User: <strong>{currentUser?.email || 'student@example.com'}</strong>
                    </div>
                  </div>
                )}

                {/* 3. RAZORPAY */}
                {selectedGateway === 'razorpay' && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>UPI & NetBanking (Razorpay)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          Enter UPI ID (Google Pay, PhonePe, Paytm, BHIM)
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okhdfcbank or mobilenumber@ybl"
                        />
                      </div>

                      <div style={{ textAlign: 'center', padding: '10px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        — OR SELECT POPULAR NETBANKING —
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          NetBanking Partner Banks
                        </label>
                        <select
                          className="input"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          style={{ width: '100%' }}
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. LOCAL PAYMENT GATEWAY */}
                {selectedGateway === 'local' && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Local Mobile Financial Services & Bank Wire</h3>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {['bKash', 'Nagad', 'Rocket', 'Bank Wire'].map(m => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setLocalMethod(m)}
                          style={{
                            flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            background: localMethod === m ? 'var(--cyan)' : 'var(--glass-surface)',
                            color: localMethod === m ? 'white' : 'var(--text-secondary)',
                            border: 'var(--border-subtle)', cursor: 'pointer'
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          Account / Mobile Number
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={localPhone}
                          onChange={(e) => setLocalPhone(e.target.value)}
                          placeholder="e.g. 017xxxxxxxx"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          Transaction Reference (TrxID)
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={localTxnId}
                          onChange={(e) => setLocalTxnId(e.target.value)}
                          placeholder="e.g. 9J47A8BZ1"
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                          Send payment of ${finalPrice.toFixed(2)} to Merchant No: <strong>+1 (800) 555-0199</strong> and enter TrxID above.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 24, paddingTop: 18, borderTop: 'var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: 14,
                      fontSize: 16,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <Lock size={16} />
                    {isProcessing ? 'Authorizing & Enrolling...' : `Complete Payment of $${finalPrice.toFixed(2)}`}
                  </button>
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                    Instant activation • 30-day money-back guarantee • Official verifiable certificate
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Coupon Code */}
            <div>
              <div style={{
                background: 'var(--glass-surface-light)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                position: 'sticky',
                top: 100
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>
                  Order Summary
                </h3>

                {/* Course preview card */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {course.duration} • Lifetime Access
                    </div>
                  </div>
                </div>

                {/* Price Calculation breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: 'var(--border-subtle)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Tuition Fee</span>
                    <span>${originalPrice.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Estimated Tax (0%)</span>
                    <span>$0.00</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 20,
                    fontWeight: 900,
                    color: 'var(--text-primary)',
                    borderTop: '2px solid var(--border-color)',
                    paddingTop: 12
                  }}>
                    <span>Total Due</span>
                    <span style={{ color: '#1fbbd2' }}>${finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal Preview */}
      {showInvoiceModal && activeInvoice && (
        <InvoiceTemplate
          invoice={activeInvoice}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
