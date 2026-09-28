import { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import {
  CreditCard, FileText, Download, CheckCircle2,
  Calendar, Search, ArrowRight, ShieldCheck, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaymentHistory() {
  const { currentUser, payments, courses, getUserInvoices, getInvoiceByPaymentId } = useLms();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');

  // Get user payments
  const userInvoices = getUserInvoices(currentUser?.id);

  // If student has no payments yet in state, show demo data for user
  const userPayments = useMemo(() => {
    const list = payments.filter(p => p.userId === currentUser?.id);
    return list.length > 0 ? list : payments.slice(0, 3);
  }, [payments, currentUser?.id]);

  const totalSpent = userPayments
    .filter(p => p.status === 'Paid')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const totalDiscounts = userPayments.reduce((acc, p) => acc + (p.discount || 0), 0);

  const filtered = useMemo(() => {
    return userPayments.filter(p => {
      const course = courses.find(c => c.id === p.courseId);
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        course?.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.gateway?.toLowerCase().includes(q)
      );
    }).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  }, [userPayments, courses, search]);

  const handleOpenInvoice = (p) => {
    // Find invoice or generate temporary view
    let inv = userInvoices.find(i => i.paymentId === p.id);
    if (!inv) {
      const course = courses.find(c => c.id === p.courseId);
      inv = {
        id: `inv-${p.id}`,
        invoiceNumber: `INV-${new Date(p.paidAt).getFullYear()}-${p.id.replace('pay-', '').padStart(3, '0')}`,
        paymentId: p.id,
        userId: currentUser?.id,
        userName: currentUser?.name || 'Ava Thompson',
        userEmail: currentUser?.email || 'ava@example.com',
        courseId: p.courseId,
        courseTitle: course?.title || 'Professional Course',
        courseCode: course?.code || 'LEAD-101',
        gateway: p.gateway ? p.gateway.charAt(0).toUpperCase() + p.gateway.slice(1) : 'Stripe',
        transactionId: p.stripeSessionId || p.id,
        subtotal: p.amount + (p.discount || 0),
        discount: p.discount || 0,
        couponCode: p.couponCode,
        tax: 0,
        total: p.amount,
        currency: p.currency || 'USD',
        status: p.status,
        issuedAt: p.paidAt,
      };
    }
    setSelectedInvoice(inv);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Payment History & Invoices</h1>
          <p>Review your course purchases, download formal tax receipts, and inspect billing details</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <span className="metric-label">Total Invested in Learning</span>
          <div className="metric-value" style={{ color: 'var(--text-primary)' }}>
            ${totalSpent.toFixed(2)}
          </div>
          <span className="metric-subtext">{userPayments.length} transactions</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Paid Invoices</span>
          <div className="metric-value" style={{ color: 'var(--cyan)' }}>
            {userPayments.filter(p => p.status === 'Paid').length}
          </div>
          <span className="metric-subtext">Verified enrollments</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Billing Protection</span>
          <div className="metric-value" style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={24} /> 100% Secure
          </div>
          <span className="metric-subtext">Verified digital receipts</span>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="data-table-container">
        {/* Search Bar Toolbar */}
        <div className="table-filter-bar">
          <div className="input-with-icon" style={{ flex: 1, maxWidth: 400 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search by course or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> transaction{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32%', minWidth: 200 }}>Course</th>
                <th style={{ width: '16%', minWidth: 120 }}>Date</th>
                <th style={{ width: '16%', minWidth: 120 }}>Payment Gateway</th>
                <th style={{ width: '14%', minWidth: 100 }}>Amount Paid</th>
                <th style={{ width: '11%', minWidth: 90 }}>Status</th>
                <th style={{ width: '11%', minWidth: 110, textAlign: 'center' }}>Receipt / Invoice</th>
              </tr>
            </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => {
                const course = courses.find(c => c.id === p.courseId);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {course?.title || 'Course Enrollment'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Ref: {p.stripeSessionId ? p.stripeSessionId.substring(0, 18) + '...' : p.id}
                      </div>
                    </td>

                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(p.paidAt)}
                    </td>

                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'rgba(31, 187, 210, 0.12)',
                        color: 'var(--cyan)',
                        textTransform: 'uppercase'
                      }}>
                        {p.gateway || 'Stripe'}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                        ${Number(p.amount).toFixed(2)}
                      </strong>
                    </td>


                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 11,
                        fontWeight: 700,
                        background: p.status === 'Paid'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : (p.status === 'Refunded' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(243, 156, 18, 0.15)'),
                        color: p.status === 'Paid'
                          ? 'var(--emerald)'
                          : (p.status === 'Refunded' ? '#ef4444' : '#f39c12')
                      }}>
                        {p.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenInvoice(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                      >
                        <FileText size={13} /> View Invoice
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <CreditCard size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>No transactions found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceTemplate
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
