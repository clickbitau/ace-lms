import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import {
  Award, Download, ExternalLink, Calendar, Lock,
  CheckCircle2, Clock, BookOpen, AlertCircle, ArrowRight,
  ShieldCheck, Search, Play
} from 'lucide-react';

export default function MyCertificates() {
  const navigate = useNavigate();
  const {
    currentUser,
    courses,
    getUserCertificates,
    getUserEnrollments,
    getCourseCompletionDetails,
    calculateCourseProgress,
    isCourseFullyCompleted,
  } = useLms();

  const [verifyInput, setVerifyInput] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Strictly completed certificates
  const certs = getUserCertificates(currentUser.id);

  // In-progress courses where certificates are strictly locked
  const userEnrollments = getUserEnrollments(currentUser.id);
  const inProgressCourses = userEnrollments
    .map(enr => {
      const course = courses.find(c => c.id === enr.courseId);
      if (!course) return null;
      const details = getCourseCompletionDetails(course.id, currentUser.id);
      const progressPct = calculateCourseProgress(course.id, currentUser.id);
      const isCompleted = isCourseFullyCompleted(course.id, currentUser.id);
      return {
        enrollment: enr,
        course,
        details,
        progressPct,
        isCompleted,
      };
    })
    .filter(Boolean)
    .filter(item => !item.isCompleted);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = (cert) => {
    setDownloadingId(cert.id);
    setTimeout(() => {
      setDownloadingId(null);
      const certContent = `=================================================================
OFFICIAL CERTIFICATE OF COMPLETION
=================================================================

This certifies that
${cert.userName || 'Student'}

has successfully completed all requirements for
${cert.courseName}

Verification Code: ${cert.verificationCode}
Issue Date: ${new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
Issuer: Training LMS Academic Board

Verify credential authenticity online at:
/verify/${cert.verificationCode}
=================================================================`;
      const blob = new Blob([certContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${cert.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${cert.verificationCode}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 600);
  };

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (verifyInput.trim()) {
      navigate(`/verify/${encodeURIComponent(verifyInput.trim())}`);
    }
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Award style={{ color: 'var(--amber)' }} size={28} />
              My Certificates
            </h1>
            <p style={{ marginTop: 4 }}>
              View and download your earned credentials, or check requirements to unlock locked certificates.
            </p>
          </div>

          {/* Quick Verification Form */}
          <form onSubmit={handleQuickVerify} style={{ display: 'flex', gap: 8, minWidth: 260 }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Search className="input-icon" size={15} />
              <input
                className="input input-sm"
                placeholder="Verify Code (e.g. VRF-...)"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                style={{ height: 36, fontSize: 12 }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ height: 36 }}>
              Verify
            </button>
          </form>
        </div>
      </div>

      {/* Strict Requirement Notice Banner */}
      <div
        className="glass-card-static"
        style={{
          marginBottom: 24,
          padding: '14px 18px',
          background: 'linear-gradient(90deg, rgba(31, 187, 210, 0.08), rgba(23, 40, 59, 0.04))',
          borderLeft: '4px solid var(--cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'rgba(31, 187, 210, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)'
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Strict Completion Policy Enforced
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Learners must complete <strong>100% of all modules and lessons</strong> to unlock and earn an official verified certificate.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earned</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>{certs.length}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Locked In-Progress</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--cyan)' }}>{inProgressCourses.length}</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Earned Certificates */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} style={{ color: 'var(--amber)' }} />
            Earned Certificates ({certs.length})
          </h2>
          {certs.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              All requirements 100% verified
            </span>
          )}
        </div>

        {certs.length === 0 ? (
          <div className="glass-card-static" style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--border-subtle)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'rgba(243, 156, 18, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              color: 'var(--amber)'
            }}>
              <Award size={28} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 6, fontSize: 16, fontWeight: 700 }}>
              No Certificates Earned Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.5 }}>
              You will receive an official certificate as soon as you finish 100% of all lessons and modules in any course. Check your in-progress courses below to see what lessons remain.
            </p>
            {inProgressCourses.length === 0 && (
              <Link to="/courses" className="btn btn-primary btn-sm">
                Explore Courses <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: 20 }}>
            {certs.map(cert => (
              <div
                key={cert.id}
                className="glass-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: '1px solid rgba(243, 156, 18, 0.35)',
                  boxShadow: '0 8px 24px -6px rgba(243, 156, 18, 0.12)',
                }}
              >
                {/* Certificate Top Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(23, 40, 59, 0.08))',
                  padding: '24px 20px',
                  textAlign: 'center',
                  borderBottom: 'var(--border-subtle)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '3px 8px', borderRadius: 999,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--emerald)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em'
                  }}>
                    <CheckCircle2 size={12} /> 100% COMPLETED
                  </div>

                  <Award size={36} style={{ color: 'var(--amber)', marginBottom: 8 }} />
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--amber)', fontWeight: 700, marginBottom: 6 }}>
                    Official Certificate of Completion
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {cert.studentName}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {cert.courseName}
                  </div>
                </div>

                {/* Certificate Details */}
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Certificate Number</span>
                      <span style={{ color: 'var(--cyan)', fontFamily: 'monospace', fontWeight: 600 }}>{cert.certificateNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Verification Code</span>
                      <span style={{ color: 'var(--emerald)', fontFamily: 'monospace', fontWeight: 600 }}>{cert.verificationCode}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Issue Date</span>
                      <span style={{ color: 'var(--text-primary)' }}>{formatDate(cert.issuedAt)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Curriculum Version</span>
                      <span style={{ color: 'var(--text-primary)' }}>v{cert.courseVersion}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => handleDownload(cert)}
                      disabled={downloadingId === cert.id}
                    >
                      <Download size={14} /> {downloadingId === cert.id ? 'Generating...' : 'Download PDF'}
                    </button>
                    <Link
                      to={`/verify/${cert.verificationCode}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <ExternalLink size={14} /> Verify Online
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Certificates in Progress (Strictly Locked) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} style={{ color: 'var(--cyan)' }} />
              Certificates In Progress ({inProgressCourses.length} Locked)
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              These certificates remain locked until every module and lesson in the course is marked completed.
            </p>
          </div>
        </div>

        {inProgressCourses.length === 0 ? (
          <div className="glass-card-static" style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No in-progress courses. All your enrolled courses are either completed or you have not yet enrolled.
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: 20 }}>
            {inProgressCourses.map(item => {
              const { course, details, progressPct } = item;
              return (
                <div
                  key={course.id}
                  className="glass-card-static"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ padding: 20 }}>
                    {/* Header: Course Title & Category */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: 'rgba(31, 187, 210, 0.12)',
                          color: 'var(--cyan)',
                          display: 'inline-block',
                          marginBottom: 6
                        }}>
                          {course.category || 'Course'}
                        </span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
                          {course.title}
                        </h3>
                      </div>

                      {/* Locked Badge */}
                      <span
                        style={{
                          background: 'rgba(243, 156, 18, 0.12)',
                          color: '#b45309',
                          border: '1px solid rgba(243, 156, 18, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '4px 10px',
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Lock size={12} /> Certificate Locked
                      </span>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div style={{ marginTop: 14, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
                        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{progressPct}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 7, borderRadius: 4 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${progressPct}%`,
                            background: 'linear-gradient(90deg, var(--cyan), #17283b)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Breakdown metrics */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: 'var(--glass-surface-light, #f8fafc)',
                      border: '1px solid rgba(23, 40, 59, 0.08)',
                      marginBottom: 14
                    }}>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Modules Done: </span>
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 12.5 }}>
                          {details.completedModules} / {details.totalModules}
                        </strong>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Lessons Done: </span>
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 12.5 }}>
                          {details.completedLessons} / {details.totalLessons}
                        </strong>
                      </div>
                    </div>

                    {/* Remaining warning */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#92400e',
                      background: '#fffbeb',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #fde68a'
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0, color: '#d97706' }} />
                      <span>{details.remainingLessons} lessons remaining across all modules to earn certificate</span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div style={{
                    padding: '12px 20px',
                    background: 'var(--surface-sunken, #f8fafc)',
                    borderTop: '1px solid rgba(23, 40, 59, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Requires 100% module & lesson completion
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/student/learn/${course.id}`)}
                      style={{ gap: 6, fontWeight: 600 }}
                    >
                      <Play size={13} /> Resume Lessons
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
