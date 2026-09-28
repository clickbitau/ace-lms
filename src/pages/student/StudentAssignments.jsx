import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import AssignmentCard from '../../components/AssignmentCard';
import {
  ClipboardCheck, Clock, CheckCircle2, AlertCircle,
  Search, BookOpen, Award, ArrowRight, Play, Filter, ChevronDown
} from 'lucide-react';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const {
    currentUser, courses, assignments, submissions,
    getUserEnrollments, enrollments
  } = useLms();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'submitted' | 'graded'
  const [courseFilter, setCourseFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Enrolled courses for this student
  const userEnrollments = getUserEnrollments(currentUser?.id);
  const enrolledCourseIds = useMemo(() => {
    const list = userEnrollments.length > 0 ? userEnrollments : enrollments;
    return new Set(list.map(e => e.courseId));
  }, [userEnrollments, enrollments]);

  // Relevant assignments (from enrolled courses, or all if none)
  const studentAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (enrolledCourseIds.size > 0 && !enrolledCourseIds.has(a.courseId)) {
        return false;
      }
      return true;
    });
  }, [assignments, enrolledCourseIds]);

  // Submissions by this student
  const mySubmissions = useMemo(() => {
    return submissions.filter(s => s.userId === currentUser?.id);
  }, [submissions, currentUser?.id]);

  // Stats calculation
  const stats = useMemo(() => {
    let pending = 0;
    let submitted = 0;
    let graded = 0;
    let totalScore = 0;
    let gradedCount = 0;

    studentAssignments.forEach(a => {
      const sub = mySubmissions.find(s => s.assignmentId === a.id);
      if (!sub) {
        pending++;
      } else if (sub.status === 'Graded') {
        graded++;
        if (typeof sub.grade === 'number') {
          totalScore += sub.grade;
          gradedCount++;
        }
      } else {
        submitted++;
      }
    });

    const avgGrade = gradedCount > 0 ? Math.round(totalScore / gradedCount) : null;

    return {
      total: studentAssignments.length,
      pending,
      submitted,
      graded,
      avgGrade
    };
  }, [studentAssignments, mySubmissions]);

  // Filtered assignments list
  const filteredAssignments = useMemo(() => {
    return studentAssignments.filter(a => {
      const sub = mySubmissions.find(s => s.assignmentId === a.id);
      const course = courses.find(c => c.id === a.courseId);

      // Status filter
      if (activeFilter === 'pending' && sub) return false;
      if (activeFilter === 'submitted' && (!sub || sub.status === 'Graded')) return false;
      if (activeFilter === 'graded' && (!sub || sub.status !== 'Graded')) return false;

      // Course filter
      if (courseFilter !== 'all' && a.courseId !== courseFilter) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const titleMatch = a.title.toLowerCase().includes(q);
        const courseMatch = course?.title?.toLowerCase().includes(q);
        const descMatch = a.description?.toLowerCase().includes(q);
        if (!titleMatch && !courseMatch && !descMatch) return false;
      }

      return true;
    });
  }, [studentAssignments, mySubmissions, activeFilter, courseFilter, search, courses]);

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>My Assignments & Practical Tasks</h1>
          <p>Submit course assignments, track evaluation deadlines, and review instructor grades and constructive feedback.</p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="stat-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon cyan"><ClipboardCheck size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned Tasks</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Active assignments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pending Upload</div>
            <div className="stat-value" style={{ color: stats.pending > 0 ? '#f39c12' : 'inherit' }}>
              {stats.pending}
            </div>
            <div className="stat-label">Action required</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan"><Award size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Under Review</div>
            <div className="stat-value">{stats.submitted}</div>
            <div className="stat-label">Awaiting evaluation</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Graded & Passed</div>
            <div className="stat-value" style={{ color: 'var(--emerald)' }}>{stats.graded}</div>
            <div className="stat-label">
              {stats.avgGrade !== null ? `Average score: ${stats.avgGrade}%` : 'Evaluation complete'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card-static" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Tasks', count: stats.total },
              { id: 'pending', label: 'Pending Upload', count: stats.pending },
              { id: 'submitted', label: 'Under Review', count: stats.submitted },
              { id: 'graded', label: 'Graded', count: stats.graded },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {tab.label}
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 10,
                  background: activeFilter === tab.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Course Dropdown */}
          <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 280, maxWidth: 540, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div className="input-with-icon" style={{ flex: '1 1 200px', minWidth: 160 }}>
              <Search className="input-icon" size={15} />
              <input
                type="text"
                className="input input-sm"
                placeholder="Search assignments or courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative', flex: '0 0 auto', minWidth: 200 }}>
              <select
                className="input input-sm"
                value={courseFilter}
                onChange={e => setCourseFilter(e.target.value)}
                style={{
                  width: '100%',
                  minWidth: 200,
                  paddingRight: 34,
                  appearance: 'none',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  background: 'var(--glass-surface-elevated, #ffffff)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(23, 40, 59, 0.15)'
                }}
              >
                <option value="all">All Enrolled Courses</option>
                {courses.filter(c => enrolledCourseIds.has(c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--cyan)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(assignment => {
            const course = courses.find(c => c.id === assignment.courseId);
            return (
              <div key={assignment.id} style={{ position: 'relative' }}>
                {/* Course Header Banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 18px',
                  background: 'var(--surface-sunken, #f1f5f9)',
                  borderTopLeftRadius: 'var(--radius-lg)',
                  borderTopRightRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color, rgba(23, 40, 59, 0.12))',
                  borderBottom: 'none',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: 'rgba(31, 187, 210, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--cyan)'
                    }}>
                      <BookOpen size={13} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {course?.title || 'Course Assignment'}
                    </span>
                    {assignment.lessonId && (
                      <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        • Linked to Lesson
                      </span>
                    )}
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/student/learn/${assignment.courseId}`)}
                    style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', color: 'var(--cyan)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    Go to Lesson Player <ArrowRight size={13} />
                  </button>
                </div>

                <AssignmentCard
                  assignment={assignment}
                  onSubmitted={() => {
                    // Triggers re-render through LmsContext state updates
                  }}
                />
              </div>
            );
          })
        ) : (
          <div className="glass-card-static" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <ClipboardCheck size={44} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No Assignments Found</h3>
            <p style={{ maxWidth: 450, margin: '0 auto 16px', fontSize: 13 }}>
              {activeFilter !== 'all'
                ? `There are no assignments matching the "${activeFilter}" filter.`
                : 'All your enrolled courses have no pending assignment tasks.'}
            </p>
            {activeFilter !== 'all' && (
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveFilter('all')}>
                Show All Tasks
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
