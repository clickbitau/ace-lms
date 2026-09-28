import { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Star, Search, Filter, Trash2, ThumbsUp, MessageSquare,
  BookOpen, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

export default function ReviewManagement() {
  const { reviews, courses, deleteReview } = useLms();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviews).toFixed(1)
    : '0.0';
  const fiveStarPct = totalReviews > 0
    ? Math.round((reviews.filter(r => r.rating === 5).length / totalReviews) * 100)
    : 0;

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (courseFilter !== 'All' && r.courseId !== courseFilter) return false;
      if (ratingFilter !== 'All' && r.rating !== Number(ratingFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const course = courses.find(c => c.id === r.courseId);
        const matchCourse = course?.title.toLowerCase().includes(q) || course?.code.toLowerCase().includes(q);
        const matchUser = r.userName?.toLowerCase().includes(q);
        const matchComment = r.comment?.toLowerCase().includes(q);
        return matchCourse || matchUser || matchComment;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reviews, courseFilter, ratingFilter, search, courses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Reviews & Feedback</h1>
          <p>Monitor student ratings, course feedback, and moderate reviews across all training tracks</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <span className="metric-label">Total Student Reviews</span>
          <div className="metric-value">{totalReviews}</div>
          <span className="metric-subtext">Across {courses.length} courses</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Platform Average Rating</span>
          <div className="metric-value" style={{ color: '#f39c12', display: 'flex', alignItems: 'center', gap: 8 }}>
            ★ {avgRating}
          </div>
          <span className="metric-subtext">Calculated from verified submissions</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">5-Star Satisfaction</span>
          <div className="metric-value" style={{ color: 'var(--emerald)' }}>{fiveStarPct}%</div>
          <span className="metric-subtext">Top-tier positive sentiment</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {/* Reviews Table Container */}
      <div className="data-table-container">
        {/* Filters Bar Toolbar */}
        <div className="table-filter-bar">
          <div className="input-with-icon" style={{ flex: '1 1 260px', minWidth: 200, maxWidth: 380 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search by student, course, or keyword..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="input"
              value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: 170 }}
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <select
              className="input"
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: 140 }}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> review{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '20%', minWidth: 180 }}>Course</th>
                <th style={{ width: '18%', minWidth: 160 }}>Student</th>
                <th style={{ width: '12%', minWidth: 110 }}>Rating</th>
                <th style={{ width: '32%', minWidth: 240 }}>Review Comment</th>
                <th style={{ width: '8%', minWidth: 80 }}>Helpful</th>
                <th style={{ width: '10%', minWidth: 110 }}>Date</th>
                <th style={{ width: '10%', minWidth: 100, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((rev) => {
                const course = courses.find(c => c.id === rev.courseId);
                return (
                  <tr key={rev.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {course?.title || 'Unknown Course'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {course?.code || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--cyan), #17283b)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {rev.userName ? rev.userName[0] : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{rev.userName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rev.userRole || 'Student'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#f39c12' }}>{rev.rating}</span>
                        <div style={{ display: 'flex' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              style={{
                                color: s <= rev.rating ? '#f39c12' : 'var(--text-muted)',
                                fill: s <= rev.rating ? '#f39c12' : 'transparent',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        margin: 0,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {rev.comment}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={12} style={{ color: 'var(--cyan)' }} /> {rev.helpfulCount || 0}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(rev.createdAt)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this review?')) {
                            deleteReview(rev.id);
                          }
                        }}
                        className="btn btn-ghost btn-sm btn-icon"
                        title="Delete review"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No reviews match the current filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} reviews
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
