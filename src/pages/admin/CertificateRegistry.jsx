import { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Award, Search, Download, ExternalLink, ShieldCheck,
  CheckCircle2, Calendar, TrendingUp, ChevronLeft, ChevronRight, Copy, Check
} from 'lucide-react';

export default function CertificateRegistry() {
  const { certificates, dashboardMetrics } = useLms();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState(null);
  const perPage = 8;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered
  const filtered = certificates.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.certificateNumber?.toLowerCase().includes(q) ||
      c.studentName?.toLowerCase().includes(q) ||
      c.courseName?.toLowerCase().includes(q) ||
      c.verificationCode?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = ['Certificate Number', 'Student Name', 'Course Name', 'Version', 'Verification Code', 'Issued Date'];
    const rows = filtered.map(c => [
      `"${c.certificateNumber}"`,
      `"${c.studentName}"`,
      `"${c.courseName}"`,
      `"v${c.courseVersion}"`,
      `"${c.verificationCode}"`,
      `"${formatDate(c.issuedAt)}"`
    ].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `certificates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Certificate Registry</h1>
          <p>Cryptographically verifiable certificate records automatically issued upon 100% completion</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Download size={16} /> Export Registry
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Total Issued</span>
            <div className="metric-icon cyan" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>
            {certificates.length || dashboardMetrics.certificatesIssued}
          </div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--cyan)' }}>Tamper-proof verifiable</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Issued This Month</span>
            <div className="metric-icon emerald" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>187</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--emerald)' }}>↑ 18% vs last month</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Issuance Success</span>
            <div className="metric-icon purple" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>99.9%</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--purple)' }}>Instant auto-dispatch</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Verification Health</span>
            <div className="metric-icon amber" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>100%</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--amber)' }}>Zero security disputes</div>
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
          <div className="input-with-icon" style={{ minWidth: 260, maxWidth: 380, flex: 1 }}>
            <Search className="input-icon" size={16} />
            <input
              className="input"
              placeholder="Search by certificate #, student, or code..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filtered.length === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} certificates
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Certificate #</th>
                <th style={{ width: '22%' }}>Student</th>
                <th style={{ width: '24%' }}>Course</th>
                <th style={{ width: '10%' }}>Version</th>
                <th style={{ width: '12%' }}>Issued Date</th>
                <th style={{ width: '12%' }}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={15} style={{ color: 'var(--cyan)' }} />
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--cyan)'
                        }}>
                          {c.certificateNumber}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: 'var(--purple)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {c.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="course-title-cell" style={{ fontWeight: 600, fontSize: 13 }}>
                          {c.studentName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.courseName}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-published" style={{ fontSize: 11 }}>
                        v{c.courseVersion}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {formatDate(c.issuedAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a
                          href={`/verify/${c.verificationCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{
                            fontSize: 12,
                            padding: '4px 8px',
                            color: 'var(--cyan)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <ExternalLink size={12} /> Verify
                        </a>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ width: 28, height: 28, padding: 0 }}
                          title="Copy verification code"
                          onClick={() => copyCode(c.verificationCode)}
                        >
                          {copiedCode === c.verificationCode ? (
                            <Check size={12} style={{ color: 'var(--emerald)' }} />
                          ) : (
                            <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    No certificates found matching your search.
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
    </div>
  );
}
