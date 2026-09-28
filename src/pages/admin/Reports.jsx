import { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  BarChart3, Download, BookOpen, Users, CreditCard, Award,
  Calendar, TrendingUp, Filter, CheckCircle2, Clock, ShieldCheck, Activity,
  ClipboardCheck
} from 'lucide-react';

export default function Reports() {
  const { dashboardMetrics, courses, enrollments, payments, certificates } = useLms();
  const [activeTab, setActiveTab] = useState('courses');
  const [timeRange, setTimeRange] = useState('30d');

  const tabs = [
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'enrollments', label: 'Enrollments', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'assignments', label: 'Assignments', icon: ClipboardCheck },
  ];

  // Chart data per tab
  const chartDatasets = {
    courses: [
      { label: 'Jan', value: 3, height: '35%' },
      { label: 'Feb', value: 4, height: '48%' },
      { label: 'Mar', value: 4, height: '48%' },
      { label: 'Apr', value: 5, height: '60%' },
      { label: 'May', value: 6, height: '72%' },
      { label: 'Jun', value: 6, height: '72%' },
      { label: 'Jul', value: 7, height: '85%' },
      { label: 'Aug', value: 8, height: '100%' },
    ],
    enrollments: [
      { label: 'Jan', value: 420, height: '40%' },
      { label: 'Feb', value: 580, height: '55%' },
      { label: 'Mar', value: 720, height: '68%' },
      { label: 'Apr', value: 850, height: '80%' },
      { label: 'May', value: 910, height: '86%' },
      { label: 'Jun', value: 1050, height: '94%' },
      { label: 'Jul', value: 1180, height: '98%' },
      { label: 'Aug', value: 1240, height: '100%' },
    ],
    payments: [
      { label: 'Jan', value: '$8.4k', height: '38%' },
      { label: 'Feb', value: '$11.2k', height: '52%' },
      { label: 'Mar', value: '$14.6k', height: '66%' },
      { label: 'Apr', value: '$18.9k', height: '82%' },
      { label: 'May', value: '$21.4k', height: '90%' },
      { label: 'Jun', value: '$24.8k', height: '95%' },
      { label: 'Jul', value: '$27.5k', height: '98%' },
      { label: 'Aug', value: '$31.2k', height: '100%' },
    ],
    certificates: [
      { label: 'Jan', value: 85, height: '35%' },
      { label: 'Feb', value: 110, height: '46%' },
      { label: 'Mar', value: 145, height: '60%' },
      { label: 'Apr', value: 170, height: '72%' },
      { label: 'May', value: 210, height: '88%' },
      { label: 'Jun', value: 230, height: '92%' },
      { label: 'Jul', value: 255, height: '96%' },
      { label: 'Aug', value: 280, height: '100%' },
    ],
    assignments: [
      { label: 'Jan', value: 45, height: '30%' },
      { label: 'Feb', value: 68, height: '45%' },
      { label: 'Mar', value: 92, height: '62%' },
      { label: 'Apr', value: 115, height: '76%' },
      { label: 'May', value: 132, height: '88%' },
      { label: 'Jun', value: 140, height: '93%' },
      { label: 'Jul', value: 148, height: '98%' },
      { label: 'Aug', value: 152, height: '100%' },
    ],
  };

  // Activity logs per tab
  const activityLogs = {
    courses: [
      { id: 1, event: 'Version Published', title: 'Full-Stack React & Node v2.1 published to production', date: '2 hours ago', status: 'Published' },
      { id: 2, event: 'Curriculum Update', title: 'Added 4 interactive video lessons to DevOps Engineering', date: 'Yesterday', status: 'Updated' },
      { id: 3, event: 'New Draft Created', title: 'UI/UX Design Masterclass initialized in authoring workspace', date: '3 days ago', status: 'Draft' },
      { id: 4, event: 'Price Updated', title: 'Data Science & Machine Learning adjusted to $129.00', date: '5 days ago', status: 'Published' },
    ],
    enrollments: [
      { id: 1, event: 'New Enrollment', title: 'Sarah Connor enrolled in Cloud Architecture with AWS', date: '12 minutes ago', status: 'Active' },
      { id: 2, event: 'Milestone Reached', title: 'Michael Scott achieved 80% completion in Leadership 101', date: '1 hour ago', status: 'In Progress' },
      { id: 3, event: 'Course Completed', title: 'Alex Chen completed Full-Stack React & Node.js', date: '3 hours ago', status: 'Completed' },
      { id: 4, event: 'New Enrollment', title: 'David Kim enrolled in Modern Web Development Bootcamp', date: '5 hours ago', status: 'Active' },
    ],
    payments: [
      { id: 1, event: 'Stripe Charge', title: 'Payment #ch_98452 succeeded for $149.00 (Sarah Connor)', date: '12 minutes ago', status: 'Paid' },
      { id: 2, event: 'Stripe Charge', title: 'Payment #ch_98451 succeeded for $99.00 (David Kim)', date: '5 hours ago', status: 'Paid' },
      { id: 3, event: 'Invoice Generated', title: 'Tax receipt auto-dispatched via Stripe Billing engine', date: '5 hours ago', status: 'Delivered' },
      { id: 4, event: 'Webhook Handled', title: 'checkout.session.completed received and signed with 200 OK', date: '5 hours ago', status: 'Processed' },
    ],
    certificates: [
      { id: 1, event: 'Certificate Generated', title: 'Issued CERT-2024-001 to Alex Chen (SHA-256 seal)', date: '3 hours ago', status: 'Verified' },
      { id: 2, event: 'Public Verification', title: 'QR code lookup performed from external IP 142.250.190.46', date: '4 hours ago', status: 'Valid' },
      { id: 3, event: 'Certificate Generated', title: 'Issued CERT-2024-002 to Sarah Jenkins (94% Score)', date: '1 day ago', status: 'Verified' },
      { id: 4, event: 'System Check', title: 'PDF rendering queue passed health check with 0 latency', date: '2 days ago', status: 'Healthy' },
    ],
    assignments: [
      { id: 1, event: 'Submission Received', title: 'Elena Rostova submitted RESTful API Integration Project', date: '10 minutes ago', status: 'Pending' },
      { id: 2, event: 'Grading Completed', title: 'Ava Thompson scored 94/100 on Leadership Roadmap', date: '2 hours ago', status: 'Graded' },
      { id: 3, event: 'Feedback Sent', title: 'Marcus Vance received review on Customer De-escalation Script', date: 'Yesterday', status: 'Graded' },
      { id: 4, event: 'Assignment Published', title: 'New practical task added to Full-Stack Web Development', date: '3 days ago', status: 'Active' },
    ],
  };

  const exportCSV = () => {
    const data = chartDatasets[activeTab];
    const headers = ['Month', 'Metric Value'];
    const rows = data.map(d => `"${d.label}","${d.value}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Reports & Business Intelligence</h1>
          <p>Real-time analytics, learning trends, and transactional intelligence</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        borderBottom: 'var(--border-subtle)',
        paddingBottom: 2,
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              background: activeTab === tab.id ? 'var(--glass-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Summary KPI Cards Row */}
      <div className="stat-cards-row">
        {activeTab === 'courses' && (
          <>
            <ReportStat label="Total Catalog Courses" value={courses.length || dashboardMetrics.totalCourses} trend="↑ 12% Q/Q" color="cyan" />
            <ReportStat label="Live Published" value={dashboardMetrics.publishedCourses} trend="100% operational" color="emerald" />
            <ReportStat label="Avg. Course Rating" value={`${dashboardMetrics.avgCourseRating} / 5`} trend="★★★★★ 4.9 avg" color="amber" />
            <ReportStat label="Drafts In Progress" value={dashboardMetrics.draftCourses} trend="Ready to publish" color="purple" />
          </>
        )}
        {activeTab === 'enrollments' && (
          <>
            <ReportStat label="Total Enrollments" value={enrollments.length || dashboardMetrics.totalEnrollments.toLocaleString()} trend={`↑ ${dashboardMetrics.enrollmentGrowth}% M/M`} color="cyan" />
            <ReportStat label="Active Learners" value={dashboardMetrics.activeEnrollments.toLocaleString()} trend="High engagement" color="emerald" />
            <ReportStat label="Curriculum Completions" value={dashboardMetrics.completedEnrollments.toLocaleString()} trend="63% completion rate" color="purple" />
            <ReportStat label="Monthly New Students" value="+324" trend="Record enrollment" color="amber" />
          </>
        )}
        {activeTab === 'payments' && (
          <>
            <ReportStat label="Gross Revenue" value={`$${dashboardMetrics.totalRevenue.toLocaleString()}`} trend={`↑ ${dashboardMetrics.revenueGrowth}% M/M`} color="amber" />
            <ReportStat label="Settled Transactions" value={payments.length || dashboardMetrics.successfulPayments.toLocaleString()} trend="100% processed" color="emerald" />
            <ReportStat label="Avg. Order Value" value="$112.50" trend="Self-service checkout" color="cyan" />
            <ReportStat label="Dispute Rate" value="0.00%" trend="Stripe Radar protected" color="purple" />
          </>
        )}
        {activeTab === 'certificates' && (
          <>
            <ReportStat label="Issued Credentials" value={certificates.length || dashboardMetrics.certificatesIssued.toLocaleString()} trend="Tamper-proof verifiable" color="cyan" />
            <ReportStat label="Verification Requests" value="1,842" trend="↑ 34% employer checks" color="emerald" />
            <ReportStat label="Issuance Success" value="99.9%" trend="Zero failed webhooks" color="purple" />
            <ReportStat label="Avg Completion Time" value="14 Days" trend="Self-paced acceleration" color="amber" />
          </>
        )}
      </div>

      {/* Visual Chart and Breakdown Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
        gap: 24,
        marginBottom: 24
      }}>
        {/* CSS Bar Chart */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: 'var(--cyan)' }} />
                Growth & Velocity Trends
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Monthly volume progression for {activeTab}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['7d', '30d', '90d', '1y'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    background: timeRange === r ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    color: timeRange === r ? 'var(--cyan)' : 'var(--text-muted)',
                    borderColor: timeRange === r ? 'var(--border-color-active)' : 'transparent'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Graphic */}
          <div className="bar-chart-bars">
            {chartDatasets[activeTab].map((item, idx) => (
              <div key={idx} className="bar-chart-col">
                <span className="bar-chart-val">{item.value}</span>
                <div className="bar-chart-bar-wrap">
                  <div
                    className="bar-chart-bar"
                    style={{
                      height: item.height,
                      background: idx === chartDatasets[activeTab].length - 1
                        ? 'linear-gradient(180deg, var(--cyan) 0%, rgba(6, 182, 212, 0.5) 100%)'
                        : 'linear-gradient(180deg, rgba(6, 182, 212, 0.7) 0%, rgba(6, 182, 212, 0.15) 100%)'
                    }}
                  />
                </div>
                <span className="bar-chart-label">{item.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: 'var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Consistent MoM growth trajectory</span>
            <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>↑ +24.8% Year-over-Year</span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} style={{ color: 'var(--emerald)' }} />
            Performance Insights
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>System Self-Service Efficiency</span>
                <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>100%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--emerald)', borderRadius: 3 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Automated Certificate Dispatch</span>
                <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>99.9%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '99.9%', height: '100%', background: 'var(--cyan)', borderRadius: 3 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Course Satisfaction Score</span>
                <span style={{ fontWeight: 700, color: 'var(--amber)' }}>97.4%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '97.4%', height: '100%', background: 'var(--amber)', borderRadius: 3 }} />
              </div>
            </div>

            <div style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', marginBottom: 4 }}>
                Key Operational Takeaway
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Learners progress 35% faster through interactive checkpoints compared to text-only lessons. Self-service automated grading operates with zero backlog.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activity / Audit Log Table */}
      <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: 'var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Audit Log — {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Immutable audit events emitted by LMS event bus
            </p>
          </div>
          <span className="badge badge-published">Live Stream</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Event Type</th>
                <th style={{ width: '50%' }}>Description</th>
                <th style={{ width: '15%' }}>Timestamp</th>
                <th style={{ width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs[activeTab].map(log => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--cyan)' }}>
                      {log.event}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                      {log.title}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {log.date}
                  </td>
                  <td>
                    <span className="badge badge-active" style={{ fontSize: 11 }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, trend, color }) {
  return (
    <div className="metric-card">
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div className="metric-value" style={{ fontSize: 26, marginBottom: 4 }}>{value}</div>
      {trend && (
        <div className="metric-trend" style={{ fontSize: 11, color: `var(--${color})` }}>
          {trend}
        </div>
      )}
    </div>
  );
}
