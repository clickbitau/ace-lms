import { useNavigate } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import {
  BookOpen, Users, DollarSign, Award, TrendingUp, AlertCircle,
  CheckCircle2, Clock, ChevronRight, BarChart3, ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    dashboardMetrics, courses, enrollments, users,
    calculateCourseProgress
  } = useLms();
  const navigate = useNavigate();
  const m = dashboardMetrics;
  const draftCourses = courses.filter(c => c.status === 'Draft');

  const activeEnrollmentsCount = (enrollments || []).filter(e => e.status === 'Active').length;
  const completedEnrollmentsCount = (enrollments || []).filter(e => e.status === 'Completed').length;

  const getUser = (id) => users.find(u => u.id === id);
  const getCourse = (id) => courses.find(c => c.id === id);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  const recentEnrollments = enrollments.slice(0, 5);

  return (
    <div className="page-content">
      {/* Hero Banner */}
      <div className="glass-card-static" style={{
        marginBottom: 28,
        padding: '32px 28px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(20, 184, 166, 0.04))',
        borderColor: 'rgba(6, 182, 212, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 6 }}>Evergreen Self-Service Training LMS</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 650, marginBottom: 20 }}>
              Administrators prepare and publish long-lived training courses. Students independently enroll, pay through Stripe, study materials step by step, and automatically receive a verified certificate at 100% completion.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'Self-Service Model', color: 'var(--cyan)' },
                { label: 'Stripe Payments', color: 'var(--emerald)' },
                { label: 'Auto Certificates', color: 'var(--amber)' },
                { label: 'Course Versioning', color: 'var(--purple)' },
                { label: 'Zero Manual Grading', color: 'var(--text-muted)' },
              ].map(pill => (
                <span key={pill.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  background: `${pill.color}15`, border: `1px solid ${pill.color}30`,
                  color: pill.color, fontSize: 11, fontWeight: 600
                }}>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-live">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <MetricCard icon={BookOpen} iconColor="cyan" label="Total Courses" value={m.totalCourses} trend={`↑ ${m.courseGrowth}% from last month`} />
        <MetricCard icon={Users} iconColor="emerald" label="Enrolled Learners" value={m.totalEnrollments.toLocaleString()} trend={`↑ ${m.enrollmentGrowth}% from last month`} />
        <MetricCard icon={DollarSign} iconColor="amber" label="Total Revenue" value={`$${m.totalRevenue.toLocaleString()}`} trend={`↑ ${m.revenueGrowth}% from last month`} />
        <MetricCard icon={Award} iconColor="purple" label="Certificates Issued" value={m.certificatesIssued.toLocaleString()} trend="↑ 22% from last month" />
      </div>

      {/* Secondary Metrics & Quick Hub */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/courses')}>
          <MiniStat label="Published Courses" value={m.publishedCourses} icon={CheckCircle2} color="var(--emerald)" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/courses')}>
          <MiniStat label="Drafts in Progress" value={m.draftCourses} icon={Clock} color="var(--amber)" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/enrollments')}>
          <MiniStat label="Active Learners" value={activeEnrollmentsCount} icon={Users} color="var(--cyan)" />
        </div>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/certificates')}>
          <MiniStat label="Completed Courses" value={completedEnrollmentsCount} icon={Award} color="var(--purple)" />
        </div>
      </div>

      {/* Main Content Grid (Balanced 2-Column) */}
      <div className="dashboard-main-grid">
        {/* Left Column: Recent Enrollments & System Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Enrollments Table Card */}
          <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: 'var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={18} style={{ color: 'var(--cyan)' }} />
                  Recent Enrollments & Learner Activity
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Live student enrollment stream and completion progress
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/admin/enrollments')}
                style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="glass-table dashboard-table">
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>Student</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Course</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Progress</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map(e => {
                    const user = getUser(e.userId);
                    const course = getCourse(e.courseId);
                    const progressPct = e.status === 'Completed' ? 100 : calculateCourseProgress(e.courseId, e.userId);

                    return (
                      <tr key={e.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: 'rgba(6, 182, 212, 0.15)',
                              color: 'var(--cyan)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : '?'}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                              {user?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontSize: 13,
                              color: 'var(--text-secondary)',
                              maxWidth: 160,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                              verticalAlign: 'middle'
                            }}
                            title={course?.title || 'Unknown'}
                          >
                            {course?.title || 'Unknown'}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: progressPct === 100 ? 'var(--emerald)' : 'var(--cyan)',
                                borderRadius: 3
                              }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{progressPct}%</span>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span className={`badge ${e.status === 'Completed' ? 'badge-completed' : 'badge-active'}`} style={{ whiteSpace: 'nowrap' }}>
                            {e.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(e.enrolledAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>



        </div>

        {/* Right Column: Drafts Queue, Financials & Architecture Note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Draft Updates */}
          <div className="glass-card-static" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={18} style={{ color: 'var(--amber)' }} />
                  Content Updates & Drafts
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Unpublished versions in authoring
                </p>
              </div>
              <span className="badge badge-draft">{draftCourses.length} Pending</span>
            </div>

            {draftCourses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {draftCourses.map(course => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/admin/courses/${course.id}/author`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'}
                  >
                    <div className="thumb-placeholder-sm" style={{ width: 44, height: 44 }}>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {course.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {course.code} • Draft changes
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All courses are published and up to date.</p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="glass-card-static" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={18} style={{ color: 'var(--cyan)' }} />
                  Payment Summary
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Stripe automated settlement records
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/admin/payments')}
                style={{ fontSize: 11 }}
              >
                Details <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PaymentRow label="Successful Payments" value={m.successfulPayments} color="var(--emerald)" />
              <PaymentRow label="Pending Webhook Settlement" value={m.pendingPayments} color="var(--amber)" />
              <PaymentRow label="Refunded Transactions" value={m.refundedPayments} color="var(--red)" />
            </div>

            <div style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <CheckCircle2 size={16} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Zero chargebacks recorded this billing cycle
              </span>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, iconColor, label, value, trend }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${iconColor}`}>
        <Icon size={22} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {trend && <div className="metric-trend"><TrendingUp size={14} /> {trend}</div>}
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card-static" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon size={18} style={{ color }} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}



function PaymentRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{value.toLocaleString()}</span>
    </div>
  );
}
