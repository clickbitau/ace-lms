import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import {
  Search, Filter, Plus, BookOpen, ChevronUp, ChevronDown,
  MoreVertical, Copy, Archive, Edit, Eye, X, Users, CheckCircle2,
  Star, TrendingUp, ChevronLeft, ChevronRight, Trash2, AlertTriangle,
  Sliders, Tag, Upload
} from 'lucide-react';
export default function CourseManagement() {
  const {
    courses, courseVersions, dashboardMetrics,
    deleteCourse, duplicateCourse, updateCourse, addCourse,
    publishCourseVersion, unpublishCourse
  } = useLms();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(['Published', 'Draft', 'Archived']);
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState(null);
  const perPage = 5;

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleFilter = (f) => {
    setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  let filtered = courses.filter(c => {
    if (!filters.includes(c.status)) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const getVersion = (course) => {
    const v = courseVersions.find(v => v.id === course.publishedVersionId)
      || courseVersions.find(v => v.courseId === course.id);
    if (!v) return '—';
    return course.status === 'Draft' ? `v${v.versionNumber} (Draft)` : `v${v.versionNumber}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
           new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const StatusBadge = ({ status }) => {
    const cls = status === 'Published' ? 'badge-published' : status === 'Draft' ? 'badge-draft' : 'badge-archived';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Course Management</h1>
          <p>Create, manage and organize your training courses</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            const newCourseId = addCourse({
              title: 'New Course Program',
              description: 'Comprehensive curriculum designed to develop skills and mastery.',
              status: 'Draft',
              price: 149
            });
            navigate(`/admin/courses/${newCourseId}/author`);
          }}
        >
          <Plus size={18} /> Create Course
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-cards-row">
        <SummaryCard icon={BookOpen} color="cyan" label="Total Courses" value={dashboardMetrics.totalCourses} trend={`↑ ${dashboardMetrics.courseGrowth}% from last month`} />
        <SummaryCard icon={CheckCircle2} color="emerald" label="Published Courses" value={dashboardMetrics.publishedCourses} trend="↑ 8% from last month" />
        <SummaryCard icon={Users} color="purple" label="Enrolled Learners" value={dashboardMetrics.totalEnrollments.toLocaleString()} trend={`↑ ${dashboardMetrics.enrollmentGrowth}% from last month`} />
        <SummaryCard icon={Star} color="amber" label="Avg. Course Rating" value={`${dashboardMetrics.avgCourseRating} / 5`} subtext="★★★★★ Excellent" />
      </div>

      {/* Main Table Card */}
      <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Search & Filters */}
        <div style={{
          padding: '16px 20px',
          borderBottom: 'var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            <div className="input-with-icon" style={{ minWidth: 240, maxWidth: 340, flex: 1 }}>
              <Search className="input-icon" size={16} />
              <input className="input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-chips">
              {['Published', 'Draft', 'Archived'].map(f => (
                <button
                  key={f}
                  className={`filter-chip ${filters.includes(f) ? 'active' : ''}`}
                  onClick={() => toggleFilter(f)}
                >
                  {f}
                  {filters.includes(f) && <X size={12} className="chip-close" />}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {filtered.length === 0 ? 0 : ((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} courses
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: 320 }}>
              <table className="glass-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Thumbnail</th>
                    <th onClick={() => toggleSort('title')} style={{ cursor: 'pointer' }}>Title <SortIcon field="title" /></th>
                    <th onClick={() => toggleSort('code')}>Code <SortIcon field="code" /></th>
                    <th onClick={() => toggleSort('category')}>Category <SortIcon field="category" /></th>
                    <th>Status</th>
                    <th>Version</th>
                    <th onClick={() => toggleSort('price')}>Price <SortIcon field="price" /></th>
                    <th onClick={() => toggleSort('enrollmentCount')}>Enrollments <SortIcon field="enrollmentCount" /></th>
                    <th onClick={() => toggleSort('updatedAt')}>Updated <SortIcon field="updatedAt" /></th>
                    <th style={{ width: 50, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(course => (
                    <tr key={course.id}>
                      <td>
                        <div
                          className="thumb-placeholder-sm"
                          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          title="Open Course Authoring & Landing Editor"
                          onClick={() => navigate(`/admin/courses/${course.id}/author`)}
                        >
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.title}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <BookOpen size={18} style={{ display: course.thumbnailUrl ? 'none' : 'block' }} />
                        </div>
                      </td>
                      <td className="course-title-cell">
                        <span
                          style={{ cursor: 'pointer', textDecoration: 'none' }}
                          title="Open Course Authoring & Landing Editor"
                          onClick={() => navigate(`/admin/courses/${course.id}/author`)}
                        >
                          {course.title}
                        </span>
                      </td>
                      <td>{course.code}</td>
                      <td>{course.category}</td>
                      <td><StatusBadge status={course.status} /></td>
                      <td>{getVersion(course)}</td>
                      <td>${course.price.toFixed(2)}</td>
                      <td>{course.enrollmentCount.toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(course.updatedAt)}
                      </td>
                      <td style={{ textAlign: 'right', position: 'relative' }}>
                        <div className="action-dropdown-container">
                          <button
                            className="btn btn-ghost btn-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === course.id ? null : course.id);
                            }}
                            title="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === course.id && (
                            <div className="action-dropdown" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`/admin/courses/${course.id}/author`);
                                }}
                              >
                                <Edit size={14} style={{ color: 'var(--cyan)' }} /> Edit Course & Landing
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  navigate(`/course/${course.slug}`);
                                }}
                              >
                                <Eye size={14} style={{ color: 'var(--emerald)' }} /> Preview
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  duplicateCourse(course.id);
                                }}
                              >
                                <Copy size={14} style={{ color: 'var(--amber)' }} /> Duplicate
                              </button>
                              <div className="action-dropdown-divider" />
                              {course.status === 'Draft' ? (
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    publishCourseVersion(course.id);
                                  }}
                                  style={{ color: 'var(--emerald)' }}
                                >
                                  <Upload size={14} /> Publish Course
                                </button>
                              ) : course.status === 'Published' ? (
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    unpublishCourse(course.id);
                                  }}
                                  style={{ color: 'var(--amber)' }}
                                >
                                  <Archive size={14} /> Unpublish (Move to Draft)
                                </button>
                              ) : null}
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  updateCourse(course.id, {
                                    status: course.status === 'Archived' ? 'Published' : 'Archived'
                                  });
                                }}
                              >
                                <Archive size={14} /> {course.status === 'Archived' ? 'Unarchive' : 'Archive'}
                              </button>
                              <button
                                className="action-dropdown-item danger"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteConfirmCourse(course);
                                }}
                              >
                                <Trash2 size={14} /> Permanent Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 20px', borderTop: 'var(--border-subtle)' }}>
            <span className="pagination-info">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} courses
            </span>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="pagination-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Permanent Delete Confirmation Modal ── */}
      {deleteConfirmCourse && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmCourse(null)}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Permanently Delete Course</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>This action cannot be undone</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteConfirmCourse(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px 0' }}>
                Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>"{deleteConfirmCourse.title}"</strong> ({deleteConfirmCourse.code})?
              </p>
              <div style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: 12,
                color: '#f87171',
                lineHeight: 1.5,
                display: 'flex',
                gap: 10
              }}>
                <Trash2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  All associated curriculum modules, lessons, content blocks, and enrolled student records for this course will be permanently removed.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmCourse(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  deleteCourse(deleteConfirmCourse.id);
                  setDeleteConfirmCourse(null);
                }}
              >
                <Trash2 size={15} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, color, label, value, trend, subtext }) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="metric-label">{label}</span>
        <div className={`metric-icon ${color}`} style={{ width: 36, height: 36, marginBottom: 0 }}>
          <Icon size={18} />
        </div>
      </div>
      <div className="metric-value" style={{ fontSize: 28 }}>{value}</div>
      {trend && <div className="metric-trend" style={{ fontSize: 11 }}><TrendingUp size={12} /> {trend}</div>}
      {subtext && <div style={{ color: 'var(--amber)', fontSize: 12, marginTop: 6 }}>{subtext}</div>}
    </div>
  );
}
