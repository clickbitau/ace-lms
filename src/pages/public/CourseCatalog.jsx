import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  BookOpen, Search, ArrowRight, Star, Users, Clock,
  GraduationCap, Filter
} from 'lucide-react';

export default function CourseCatalog() {
  const { courses, getCourseRatingStats } = useLms();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const published = courses.filter(c => c.status === 'Published');
  const categories = ['All', ...new Set(published.map(c => c.category))];

  const filtered = published.filter(c => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: 'var(--border-subtle)', background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--cyan), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <GraduationCap size={20} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Training LMS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle size="sm" />
          <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
          <Link to="/student" className="btn btn-ghost btn-sm">Student</Link>
          <button className="btn btn-primary btn-sm">Sign In</button>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '64px 32px 40px',
        background: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.05), transparent)'
      }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>
          Discover Expert<br />Training Courses
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto 32px' }}>
          Self-paced professional courses with automatic certification upon completion.
        </p>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="input-with-icon">
            <Search className="input-icon" size={18} />
            <input className="input" style={{ padding: '14px 14px 14px 44px', fontSize: 15, borderRadius: 'var(--radius-full)' }}
              placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '0 32px 32px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600,
              background: selectedCategory === cat ? 'var(--cyan)' : 'var(--glass-surface)',
              color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
              border: selectedCategory === cat ? 'none' : 'var(--border-subtle)',
              transition: 'all var(--transition-fast)'
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Course Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 64px' }}>
        <div className="grid grid-3">
          {filtered.map(course => (
            <div key={course.id} className="course-card" onClick={() => navigate(`/course/${course.slug}`)}>
              <div className="course-card-thumb">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="thumb-placeholder"
                  style={{ display: course.thumbnailUrl ? 'none' : 'flex' }}
                >
                  <BookOpen size={40} />
                </div>
              </div>
              <div className="course-card-body">
                <div className="course-card-category">{course.category}</div>
                <div className="course-card-title">{course.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 450, marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {course.duration}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {course.enrollmentCount}</span>
                  </div>
                  {(() => {
                    const stats = getCourseRatingStats(course.id);
                    const effectiveRating = stats.totalReviews > 0 ? stats.avgRating : course.rating;
                    return effectiveRating > 0 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f39c12', fontWeight: 600 }}>
                        <Star size={13} fill="#f39c12" /> {effectiveRating}
                        {stats.totalReviews > 0 && (
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>({stats.totalReviews})</span>
                        )}
                      </span>
                    ) : null;
                  })()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                  <button className="btn btn-primary btn-sm">Enroll Now <ArrowRight size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
