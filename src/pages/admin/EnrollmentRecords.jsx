import { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Users, Search, Download, CheckCircle2, Clock,
  TrendingUp, BookOpen, ChevronLeft, ChevronRight, X
} from 'lucide-react';

export default function EnrollmentRecords() {
  const { enrollments, courses, users, calculateCourseProgress } = useLms();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const getUser = (id) => users.find(u => u.id === id);
  const getCourse = (id) => courses.find(c => c.id === id);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // Stats calculation
  const totalCount = enrollments.length;
  const activeCount = enrollments.filter(e => e.status === 'Active').length;
  const completedCount = enrollments.filter(e => e.status === 'Completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered enrollments
  const filtered = enrollments.filter(e => {
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    const user = getUser(e.userId);
    const course = getCourse(e.courseId);
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      user?.name?.toLowerCase().includes(q) ||
      user?.email?.toLowerCase().includes(q) ||
      course?.title?.toLowerCase().includes(q) ||
      course?.code?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const StatusBadge = ({ status }) => {
    const cls = status === 'Active' ? 'badge-active' : status === 'Completed' ? 'badge-completed' : 'badge-pending';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'Student Email', 'Course Code', 'Course Title', 'Status', 'Enrolled Date', 'Completed Date'];
    const rows = filtered.map(e => {
      const user = getUser(e.userId);
      const course = getCourse(e.courseId);
      return [
        `"${user?.name || 'Unknown'}"`,
        `"${user?.email || ''}"`,
        `"${course?.code || ''}"`,
        `"${course?.title || ''}"`,
        `"${e.status}"`,
        `"${formatDate(e.enrolledAt)}"`,
        `"${formatDate(e.completedAt)}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enrollments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Enrollment Records</h1>
          <p>Track learner progress, active sessions, and course completion across the system</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Total Enrollments</span>
            <div className="metric-icon cyan" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{totalCount}</div>
          <div className="metric-trend" style={{ fontSize: 11 }}><TrendingUp size={12} /> All registered learners</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Active Learners</span>
            <div className="metric-icon emerald" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{activeCount}</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--emerald)' }}>In progress now</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Completed</span>
            <div className="metric-icon purple" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{completedCount}</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--purple)' }}>100% curriculum done</div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="metric-label">Completion Rate</span>
            <div className="metric-icon amber" style={{ width: 36, height: 36, marginBottom: 0 }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 26 }}>{completionRate}%</div>
          <div className="metric-trend" style={{ fontSize: 11, color: 'var(--amber)' }}>Self-paced pace</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filters Toolbar */}
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
                placeholder="Search student, email, or course..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div className="filter-chips">
              {['All', 'Active', 'Completed'].map(status => (
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
            Showing {filtered.length === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} records
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Student</th>
                <th style={{ width: '25%' }}>Course</th>
                <th style={{ width: '18%' }}>Progress</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '10%' }}>Enrolled</th>
                <th style={{ width: '10%' }}>Completed</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map(e => {
                  const user = getUser(e.userId);
                  const course = getCourse(e.courseId);
                  const progressPct = e.status === 'Completed' ? 100 : calculateCourseProgress(e.courseId, e.userId);

                  return (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: 'var(--cyan)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                              {user?.name || 'Unknown Student'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {user?.email || 'no-email@example.com'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="course-title-cell" style={{ fontSize: 13, fontWeight: 600 }}>
                            {course?.title || 'Unknown Course'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <BookOpen size={11} /> {course?.code || 'N/A'} • {course?.category || 'General'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 160 }}>
                          <div style={{
                            flex: 1,
                            height: 6,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progressPct}%`,
                              background: progressPct === 100
                                ? 'var(--emerald)'
                                : 'linear-gradient(90deg, var(--cyan), var(--emerald))',
                              borderRadius: 3,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: progressPct === 100 ? 'var(--emerald)' : 'var(--text-secondary)', minWidth: 32 }}>
                            {progressPct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={e.status} />
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {formatDate(e.enrolledAt)}
                      </td>
                      <td style={{ fontSize: 12, color: e.completedAt ? 'var(--emerald)' : 'var(--text-muted)' }}>
                        {formatDate(e.completedAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                    No enrollments match the selected filters.
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
