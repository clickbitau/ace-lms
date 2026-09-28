import { useRef } from 'react';
import {
  Printer, Download, CheckCircle2, GraduationCap, X,
  ShieldCheck, Calendar, Hash, CreditCard
} from 'lucide-react';

export default function InvoiceTemplate({ invoice, onClose }) {
  const invoiceRef = useRef(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200, backgroundColor: 'rgba(5, 14, 20, 0.75)', backdropFilter: 'blur(8px)' }}>
      <div
        className="modal invoice-modal-container"
        style={{
          maxWidth: 700,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--card-bg, #ffffff)',
          background: 'var(--card-bg, #ffffff)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(31, 187, 210, 0.3)',
          borderRadius: 16,
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Action Header (hidden on print) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-surface, #f8fafc)',
          background: 'var(--card-surface, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Hash size={18} style={{ color: 'var(--cyan)' }} />
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)', fontWeight: 700 }}>Tax Invoice & Payment Receipt</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon btn-sm"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div
          ref={invoiceRef}
          className="printable-invoice"
          style={{
            padding: '36px 40px',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            backgroundColor: 'var(--card-bg, #ffffff)',
            background: 'var(--card-bg, #ffffff)'
          }}
        >
          {/* Header Row: Brand & Status Stamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1fbbd2, #17283b)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    Training LMS
                  </h2>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Professional Skills Academy Inc.</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                100 Innovation Parkway, Suite 400<br />
                Silicon Valley, CA 94025, USA<br />
                tax-id: US-88492019-LMS
              </div>
            </div>

            {/* Invoice Meta & PAID Stamp */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-block',
                border: '2px solid #10b981',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                padding: '4px 14px',
                borderRadius: 6,
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12,
                transform: 'rotate(-4deg)'
              }}>
                ✓ PAID
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Date: {formatDate(invoice.issuedAt)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Payment Ref: <code style={{ color: 'var(--cyan)' }}>{invoice.transactionId?.substring(0, 16)}...</code>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: 'var(--border-subtle)', margin: '24px 0' }} />

          {/* Billed To / Payment Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                BILLED TO:
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {invoice.userName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {invoice.userEmail}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Account Status: Verified Student
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                PAYMENT METHOD:
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CreditCard size={15} style={{ color: 'var(--cyan)' }} />
                {invoice.gateway || 'Stripe Checkout'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--emerald)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                <CheckCircle2 size={13} /> Electronic Signature Verified
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Currency: {invoice.currency || 'USD'}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 28,
            fontSize: 13,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{
                background: 'var(--card-surface, #f8fafc)',
                backgroundColor: 'var(--card-surface, #f8fafc)',
                borderBottom: '2px solid var(--border-color)',
                textAlign: 'left'
              }}>
                <th style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>Item Description</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)' }}>Access</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right', color: 'var(--text-primary)' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {invoice.courseTitle}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    Course Code: {invoice.courseCode} • Self-Paced Masterclass & Certificate
                  </div>
                </td>
                <td style={{ padding: '16px 14px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Lifetime
                </td>
                <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ${Number(invoice.subtotal).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 36 }}>
            <div style={{ width: 260 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${Number(invoice.subtotal).toFixed(2)}</span>
              </div>

              {invoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}>
                  <span>Discount ({invoice.couponCode || 'Promo'})</span>
                  <span>-${Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Estimated Tax (0%)</span>
                <span>$0.00</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0 6px',
                borderTop: '2px solid var(--border-color)',
                fontSize: 18,
                fontWeight: 900,
                color: 'var(--text-primary)'
              }}>
                <span>Total Paid</span>
                <span style={{ color: 'var(--cyan)' }}>${Number(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div style={{
            padding: '14px 18px',
            background: 'var(--card-surface, #f8fafc)',
            backgroundColor: 'var(--card-surface, #f8fafc)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Terms & Certification Policy: </strong>
            This receipt confirms your full course tuition and lifetime platform access.
            Certificates of completion are issued automatically upon achieving 100% progress across all required lesson blocks and modules.
            Questions or support: <span style={{ color: 'var(--cyan)' }}>support@traininglms.com</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
