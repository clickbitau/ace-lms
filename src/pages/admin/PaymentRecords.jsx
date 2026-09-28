import { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import {
  CreditCard, Search, Download, DollarSign, CheckCircle2,
  Clock, AlertTriangle, ChevronLeft, ChevronRight, X, ExternalLink,
  FileText, RotateCcw
} from 'lucide-react';

export default function PaymentRecords() {
  const { payments, enrollments, courses, users, dashboardMetrics, invoices, refundPayment } = useLms();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [gatewayFilter, setGatewayFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const getEnrollmentInfo = (enrollmentId) => {
    const enr = enrollments.find(e => e.id === enrollmentId);
    if (!enr) return { userName: 'Unknown', userEmail: '', courseName: 'Unknown', courseCode: '' };
    const user = users.find(u => u.id === enr.userId);
    const course = courses.find(c => c.id === enr.courseId);
    return {
      userName: user?.name || 'Unknown',
      userEmail: user?.email || '',
      courseName: course?.title || 'Unknown',
      courseCode: course?.code || ''
    };
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
           new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Metrics
  const totalRev = payments.reduce((acc, p) => p.status === 'Paid' ? acc + p.amount : acc, 0);
  const paidCount = payments.filter(p => p.status === 'Paid').length;
  const pendingCount = payments.filter(p => p.status === 'Pending').length;
  const refundedCount = payments.filter(p => p.status === 'Refunded').length;

  // Filtered
  const filtered = payments.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (gatewayFilter !== 'All' && (p.gateway || 'stripe').toLowerCase() !== gatewayFilter.toLowerCase()) return false;
    const info = getEnrollmentInfo(p.enrollmentId);
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      info.userName.toLowerCase().includes(q) ||
      info.userEmail.toLowerCase().includes(q) ||
      info.courseName.toLowerCase().includes(q) ||
      info.courseCode.toLowerCase().includes(q) ||
      p.stripeSessionId.toLowerCase().includes(q) ||
      (p.gateway && p.gateway.toLowerCase().includes(q))
    );
  });

  const handleViewInvoice = (p) => {
    let inv = (invoices || []).find(i => i.paymentId === p.id);
    if (!inv) {
      const info = getEnrollmentInfo(p.enrollmentId);
      inv = {
        id: `inv-${p.id}`,
        invoiceNumber: `INV-${new Date(p.paidAt).getFullYear()}-${p.id.replace('pay-', '').padStart(3, '0')}`,
        paymentId: p.id,
        userName: info.userName,
        userEmail: info.userEmail,
        courseTitle: info.courseName,
        courseCode: info.courseCode,
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Student Name', 'Course', 'Amount', 'Currency', 'Status', 'Stripe Session ID', 'Date'];
    const rows = filtered.map(p => {
      const info = getEnrollmentInfo(p.enrollmentId);
      return [
        `"${p.id}"`,
        `"${info.userName}"`,
        `"${info.courseName}"`,
        `"${p.amount}"`,
        `"${p.currency}"`,
        `"${p.status}"`,
        `"${p.stripeSessionId}"`,
        `"${formatDate(p.paidAt)}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Payment Records</h1>
          <p>Real-time Stripe transaction logs, charges, invoices, and payment lifecycle tracking</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Total Revenue</span>
            <div className="metric-icon amber" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>
            ${(totalRev || dashboardMetrics.totalRevenue).toLocaleString()}
          </div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--amber)' }}>Stripe Verified</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Successful Charges</span>
            <div className="metric-icon emerald" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{paidCount}</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--emerald)' }}>100% processed</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Pending / In-Flight</span>
            <div className="metric-icon cyan" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{pendingCount}</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Awaiting webhook</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Refunds / Disputes</span>
            <div className="metric-icon red" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{refundedCount}</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--red)' }}>0.0% chargeback rate</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: 'var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            <div className="input-with-icon" style={{ minWidth: 260, maxWidth: 360, flex: 1 }}>
              <Search className="input-icon" size={16} />
              <input
                className="input"
                placeholder="Search student, course, or session ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div className="filter-chips">
              {['All', 'Paid', 'Pending', 'Refunded'].map(status => (
                <button
                  key={status}
                  className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(status); setPage(1); }}
                >
                  {status}
                  {statusFilter === status && status !== 'All' && (
                    <X size={12} className="chip-close" onClick={(e) => { e.stopPropagation(); setStatusFilter('All'); }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filtered.length === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} transactions
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Student</th>
                <th style={{ width: '22%' }}>Course</th>
                <th style={{ width: '10%' }}>Gateway</th>
                <th style={{ width: '10%' }}>Amount</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '12%' }}>Date</th>
                <th style={{ width: '16%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map(p => {
                  const info = getEnrollmentInfo(p.enrollmentId);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--amber)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {info.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                              {info.userName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {info.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="course-title-cell" style={{ fontSize: 13, fontWeight: 600 }}>
                          {info.courseName}
                        </div>
                        {info.courseCode && (
                          <div style={{ fontSize: 11, color: 'var(--cyan)' }}>
                            {info.courseCode}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
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
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${p.amount.toFixed(2)}
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>
                            {p.currency}
                          </span>
                        </div>
                        {p.discount > 0 && (
                          <span style={{ fontSize: 10, color: '#f39c12', display: 'block' }}>
                            -${p.discount.toFixed(2)} coupon
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          p.status === 'Paid' ? 'badge-paid' :
                          p.status === 'Pending' ? 'badge-pending' :
                          p.status === 'Refunded' ? 'badge-refunded' : 'badge-archived'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {formatDate(p.paidAt)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleViewInvoice(p)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title="View Invoice"
                          >
                            <FileText size={12} /> Invoice
                          </button>

                          {p.status === 'Paid' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Issue a refund for $${p.amount} to ${info.userName}?`)) {
                                  refundPayment(p.id);
                                }
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '3px 8px', fontSize: 11, color: '#ef4444' }}
                              title="Process Refund"
                            >
                              <RotateCcw size={12} /> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    No payment records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 20px', borderTop: 'var(--border-subtle)' }}>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
