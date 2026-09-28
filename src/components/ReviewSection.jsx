import { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import {
  Star, ThumbsUp, Trash2, MessageSquare, CheckCircle2,
  AlertCircle, Filter, ArrowUpDown
} from 'lucide-react';

export default function ReviewSection({ courseId }) {
  const {
    currentUser,
    getReviewsForCourse,
    getCourseRatingStats,
    addReview,
    deleteReview,
    voteReviewHelpful,
    getEnrollment
  } = useLms();

  const reviews = getReviewsForCourse(courseId);
  const stats = getCourseRatingStats(courseId);
  const isEnrolled = !!getEnrollment(courseId, currentUser?.id) || currentUser?.role === 'Admin';

  const userExistingReview = useMemo(() => {
    return reviews.find(r => r.userId === currentUser?.id);
  }, [reviews, currentUser?.id]);

  const [rating, setRating] = useState(userExistingReview ? userExistingReview.rating : 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(userExistingReview ? userExistingReview.comment : '');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'lowest' | 'helpful'
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'highest') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'lowest') {
      return list.sort((a, b) => a.rating - b.rating);
    }
    if (sortBy === 'helpful') {
      return list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }
    return list;
  }, [reviews, sortBy]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setErrorMsg('Please select a star rating between 1 and 5');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMsg('Please write at least 10 characters for your feedback');
      return;
    }
    setErrorMsg('');
    addReview(courseId, { rating, comment: comment.trim() });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass-card-static" style={{ marginTop: 32, padding: '28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <MessageSquare size={20} style={{ color: 'var(--cyan)' }} />
            Student Reviews & Ratings
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            Feedback from verified enrolled students
          </p>
        </div>

        {reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpDown size={13} /> Sort by:
            </span>
            <select
              className="input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px 12px', fontSize: 12, width: 'auto', minWidth: 120 }}
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        )}
      </div>

      {/* Ratings Breakdown Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 220px) 1fr',
        gap: 28,
        padding: '20px 24px',
        background: 'var(--glass-surface-light)',
        border: 'var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 28,
        alignItems: 'center'
      }}>
        {/* Left: Overall Score */}
        <div style={{ textAlign: 'center', borderRight: 'var(--border-subtle)', paddingRight: 20 }}>
          <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 8 }}>
            {stats.avgRating > 0 ? stats.avgRating : '—'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                style={{
                  color: s <= Math.round(stats.avgRating) ? '#f39c12' : 'var(--text-muted)',
                  fill: s <= Math.round(stats.avgRating) ? '#f39c12' : 'transparent',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {stats.totalReviews} {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
          </div>
        </div>

        {/* Right: Stars Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.distribution[stars] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 44, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                  {stars} <Star size={12} fill="#f39c12" color="#f39c12" />
                </span>
                <div style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  background: 'var(--glass-surface-hover)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: stars >= 4 ? '#1fbbd2' : (stars === 3 ? '#f39c12' : '#ef4444'),
                    borderRadius: 4,
                    transition: 'width 0.4s ease'
                  }} />
                </div>
                <span style={{ width: 36, textAlign: 'right', color: 'var(--text-muted)', fontSize: 11 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form */}
      {isEnrolled ? (
        <form onSubmit={handleSubmit} style={{
          padding: 20,
          background: 'var(--glass-surface-light)',
          border: '1px solid rgba(31, 187, 210, 0.25)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 32
        }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            {userExistingReview ? 'Edit Your Review' : 'Share Your Experience'}
          </h4>

          {/* Star Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your Rating:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 4,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={24}
                    style={{
                      color: star <= (hoverRating || rating) ? '#f39c12' : 'var(--text-muted)',
                      fill: star <= (hoverRating || rating) ? '#f39c12' : 'transparent',
                    }}
                  />
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f39c12', minWidth: 60 }}>
              {hoverRating || rating} / 5
            </span>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: 14 }}>
            <textarea
              className="input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this course? How did it help your skills? Share feedback for future students..."
              style={{
                width: '100%',
                resize: 'vertical',
                fontSize: 13,
                lineHeight: 1.5,
                background: 'var(--input-bg)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>Minimum 10 characters</span>
              <span>{comment.length} characters</span>
            </div>
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 12, marginBottom: 12 }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          {submitSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', fontSize: 12, marginBottom: 12 }}>
              <CheckCircle2 size={14} /> Your review was published successfully!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Star size={14} /> {userExistingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(31, 187, 210, 0.08)',
          border: '1px dashed rgba(31, 187, 210, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
              Enrolled in this course?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Enroll today to share your rating and review with the learning community.
            </div>
          </div>
        </div>
      )}

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sortedReviews.length > 0 ? (
          sortedReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                padding: '18px 20px',
                background: 'var(--glass-surface-light)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--cyan), #17283b)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13
                  }}>
                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {rev.userName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {rev.userRole || 'Student'} • {formatDate(rev.createdAt)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        style={{
                          color: s <= rev.rating ? '#f39c12' : 'var(--text-muted)',
                          fill: s <= rev.rating ? '#f39c12' : 'transparent',
                        }}
                      />
                    ))}
                  </div>

                  {(currentUser?.role === 'Admin' || rev.userId === currentUser?.id) && (
                    <button
                      onClick={() => deleteReview(rev.id)}
                      title="Delete review"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p style={{
                color: 'var(--text-primary)',
                fontSize: 13,
                lineHeight: 1.6,
                margin: '8px 0 14px',
                whiteSpace: 'pre-line'
              }}>
                {rev.comment}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => voteReviewHelpful(rev.id)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <ThumbsUp size={12} /> Helpful ({rev.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No reviews yet for this course.</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Be the first enrolled student to leave a review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
