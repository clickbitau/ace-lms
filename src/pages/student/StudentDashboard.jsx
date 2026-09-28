import { useNavigate } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import {
  BookOpen, CheckCircle2, Award, ArrowRight, Download,
  Clock, Monitor
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const {
    currentUser, courses, getUserEnrollments, getUserCertificates,
    calculateCourseProgress, isCourseFullyCompleted, enrollments
  } = useLms();

  const myEnrollments = getUserEnrollments(currentUser.id);
  const myCertificates = getUserCertificates(currentUser.id);

  // If the logged in user has no personal enrollments (e.g. fresh admin session), use demo student data so view is fully functional
  const userEnrollments = myEnrollments.length > 0 ? myEnrollments : enrollments;
  // Strictly display only verified earned certificates (requires 100% of all modules and lessons completed)
  const userCertificates = myCertificates;
  const activeEnrollments = userEnrollments.filter(e => !isCourseFullyCompleted(e.courseId, e.userId));
  const completedEnrollments = userEnrollments.filter(e => isCourseFullyCompleted(e.courseId, e.userId));

  return (
    <div className="page-content">
      {/* Welcome Header */}
      <div className="page-header">
        <h1>My Learning</h1>
        <p>Track your progress and continue your learning journey.</p>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon cyan"><Monitor size={24} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Courses in Progress</div>
            <div className="stat-value">{activeEnrollments.length}</div>
            <div className="stat-label">Active courses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon emerald"><CheckCircle2 size={24} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Completed</div>
            <div className="stat-value">{completedEnrollments.length}</div>
            <div className="stat-label">Courses finished</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Award size={24} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Certificates Earned</div>
            <div className="stat-value">{userCertificates.length}</div>
            <div className="stat-label">View all certificates</div>
          </div>
        </div>
      </div>

      <div className="layout-with-sidebar">
        {/* Course Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20 }}>My Courses</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/courses')}>
              View All Courses <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {activeEnrollments.length === 0 ? (
              <div className="glass-card-static" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                <BookOpen size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                <h3>No active enrollments</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Explore our course catalog to start learning.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/courses')}>Browse Courses</button>
              </div>
            ) : (
              activeEnrollments.map(enr => {
                const course = courses.find(c => c.id === enr.courseId);
                if (!course) return null;
                const progress = calculateCourseProgress(course.id, enr.userId);

                return (
                  <div key={enr.id} className="course-card" onClick={() => navigate(`/student/learn/${course.id}`)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                    <div className="course-card-thumb">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="course-card-fallback-icon" style={{ display: course.thumbnailUrl ? 'none' : 'flex' }}>
                        <BookOpen size={36} />
                      </div>
                      <span className="badge badge-active" style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(23, 40, 59, 0.85)', backdropFilter: 'blur(4px)', color: 'var(--cyan)', border: '1px solid rgba(31, 187, 210, 0.3)' }}>
                        {course.category}
                      </span>
                    </div>
                    <div className="course-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
                      <div className="course-card-title">{course.title}</div>
                      <div className="course-card-desc">
                        {course.description || course.shortDescription || 'Master essential frameworks and core concepts in this comprehensive course.'}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>{progress}% complete</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}>
                            <Clock size={12} /> {course.duration || (course.estimatedHours ? `${course.estimatedHours}h` : '15 hours')}
                          </span>
                        </div>
                        <div className="progress-bar" style={{ height: 6, borderRadius: 3, marginBottom: 4 }}>
                          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: 'var(--cyan)' }} />
                        </div>
                      </div>
                    </div>
                    <div className="course-card-footer">
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cyan)' }}>Continue Learning</span>
                      <ArrowRight size={14} style={{ color: 'var(--cyan)' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Certificate Summary */}
          <div className="glass-card-static">
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Recent Certificates</h3>
            {userCertificates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                <Award size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                No certificates earned yet. Complete all modules and lessons in a course to earn your certificate.
              </div>
            ) : (
              userCertificates.slice(0, 3).map(cert => (
                <div key={cert.id} className="certificate-card" style={{ margin: '8px 0', padding: 10 }}>
                  <div className="certificate-icon">
                    <Award size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cert.courseName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" title="View Certificate" onClick={() => navigate('/student/certificates')}>
                    <Download size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Self-Paced Learning Info Card */}
          <div className="glass-card-static" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} style={{ color: 'var(--cyan)' }} />
              Self-Paced Learning
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Study entirely at your own pace. Lessons, video modules, and materials are accessible 24/7. Certificates are issued automatically upon 100% course completion.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--cyan)' }}
              onClick={() => navigate('/courses')}
            >
              Browse Course Catalog <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
