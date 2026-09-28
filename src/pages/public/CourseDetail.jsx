import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  BookOpen, Clock, Users, Star, CheckCircle2, ArrowRight,
  CreditCard, Shield, Award, GraduationCap, Play, FileText,
  Monitor, ChevronDown, ChevronRight, ArrowLeft, Sparkles, Sliders
} from 'lucide-react';

const getFeatureIcon = (iconName) => {
  switch (iconName) {
    case 'Clock': return Clock;
    case 'Award': return Award;
    case 'Monitor': return Monitor;
    case 'Shield': return Shield;
    case 'FileText': return FileText;
    case 'Users': return Users;
    case 'Star': return Star;
    case 'Sparkles': return Sparkles;
    default: return CheckCircle2;
  }
};

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { courses, currentUser, enrollAndPay, getEnrollment, getSectionsForCourse, getLessonsForSection } = useLms();
  const course = courses.find(c => c.slug === slug);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!course) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Course not found</p>
    </div>
  );

  const enrollment = getEnrollment(course.id, currentUser.id);
  const sections = getSectionsForCourse(course.id);
  const isEnrolled = !!enrollment;

  const handleEnroll = () => {
    if (course.price === 0) {
      enrollAndPay(course.id);
      navigate(`/student/learn/${course.id}`);
    } else {
      navigate(`/checkout/${course.id}`);
    }
  };

  const handlePay = () => {
    enrollAndPay(course.id);
    setPaymentDone(true);
    setTimeout(() => {
      navigate(`/student/learn/${course.id}`);
    }, 2000);
  };

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Instructor';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Header */}
      <header style={{
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: 'var(--border-subtle)', background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--cyan), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <GraduationCap size={20} />
          </div>
          <Link to="/courses" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back to Courses</Link>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeToggle size="sm" />
          {isAdmin && (
            <>
              <button
                onClick={() => navigate(`/admin/courses/${course.id}/author`)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: 'rgba(6,182,212,0.3)', color: 'var(--cyan)' }}
              >
                <Sliders size={13} /> Edit Course
              </button>
              <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>
            </>
          )}
          <Link to="/student" className="btn btn-ghost btn-sm">
            {isAdmin ? 'Student' : 'My Dashboard'}
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
          {/* Left: Course Info */}
          <div>
            <div className="course-card-category" style={{ marginBottom: 8 }}>{course.category}</div>
            <h1 style={{ fontSize: 32, marginBottom: 12, lineHeight: 1.2 }}>{course.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{course.description}</p>

            <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}><Clock size={16} /> {course.duration}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}><Users size={16} /> {course.enrollmentCount} students</span>
              {course.rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--amber)' }}><Star size={16} fill="var(--amber)" /> {course.rating}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--emerald)' }}><Award size={16} /> Certificate included</span>
            </div>

            {/* Learning Objectives */}
            <div className="glass-card-static" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16 }}>What You'll Learn</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {course.objectives?.map((obj, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--emerald)', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="glass-card-static">
              <h3 style={{ marginBottom: 16 }}>Course Content</h3>
              {sections.length > 0 ? sections.map((sec, i) => {
                const secLessons = getLessonsForSection(sec.id);
                return (
                  <div key={sec.id} style={{ borderBottom: i < sections.length - 1 ? 'var(--border-subtle)' : 'none', padding: '12px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{sec.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{secLessons.length} lessons</span>
                    </div>
                  </div>
                );
              }) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Course structure will be available upon enrollment.</p>
              )}
            </div>
          </div>

          {/* Right: Pricing Card */}
          <div>
            <div className="glass-card-static" style={{
              position: 'sticky', top: 100,
              border: '1px solid rgba(6, 182, 212, 0.2)',
              boxShadow: 'var(--glow-cyan)',
              padding: 0,
              overflow: 'hidden'
            }}>
              {course.thumbnailUrl && (
                <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5, 14, 20, 0.1) 0%, rgba(13, 31, 40, 0.95) 100%)'
                  }} />
                </div>
              )}
              <div style={{ padding: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {course.pricingSubtitle || (course.price === 0 ? 'Free enrollment • Lifetime access' : 'One-time payment • Lifetime access')}
                  </div>
                </div>

                {isEnrolled ? (
                  <button className="btn btn-primary" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #0284c7 0%, #1fbbd2 100%)', boxShadow: '0 4px 14px rgba(31, 187, 210, 0.38)', border: 'none' }} onClick={() => navigate(`/student/learn/${course.id}`)}>
                    <Play size={18} /> Continue Learning
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={handleEnroll}>
                    <CreditCard size={18} /> {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                  </button>
                )}

                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(course.features && Array.isArray(course.features) && course.features.length > 0
                    ? course.features.filter(f => f.enabled !== false).map(f => ({ icon: getFeatureIcon(f.icon), label: f.label }))
                    : [
                        { icon: Clock, label: `${course.duration} of content` },
                        { icon: Award, label: 'Certificate of completion' },
                        { icon: Monitor, label: 'Full lifetime access' },
                        { icon: Shield, label: 'Secure Stripe payment' },
                      ]
                  ).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <item.icon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => !paymentDone && setShowCheckout(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{paymentDone ? 'Payment Confirmed!' : 'Complete Your Enrollment'}</h3>
              {!paymentDone && <button onClick={() => setShowCheckout(false)} className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>✕</button>}
            </div>
            <div className="modal-body">
              {paymentDone ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={48} style={{ color: 'var(--emerald)', marginBottom: 16 }} />
                  <h3 style={{ marginBottom: 8 }}>Payment Verified!</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Stripe webhook confirmed. Redirecting to your course...</p>
                  <div className="progress-bar" style={{ marginTop: 16 }}>
                    <div className="progress-bar-fill" style={{ width: '100%', animation: 'none' }} />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ padding: 16, background: 'var(--glass-surface-light)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Course</span>
                      <span style={{ fontWeight: 600 }}>{course.title}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Price</span>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>${course.price.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Currency</span>
                      <span>{course.currency}</span>
                    </div>
                  </div>
                  <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                    <p style={{ fontSize: 12, color: 'var(--amber)' }}>
                      <Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Server-authoritative price. Secure Stripe Checkout. Access granted only after webhook verification.
                    </p>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={handlePay}>
                    <CreditCard size={18} /> Pay with Test Stripe
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                    Simulates Stripe checkout → webhook verification → enrollment activation
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
