import { useState, useMemo, useRef } from 'react';
import { useLms } from '../../context/LmsContext';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import {
  FileText, Award, CheckCircle2, Clock, AlertTriangle,
  Search, Filter, Download, Plus, Trash2, Edit3, X,
  Calendar, Check, User, ArrowUpDown, Upload, Paperclip, ChevronDown, Eye
} from 'lucide-react';

export default function AssignmentGrading() {
  const {
    courses, assignments, submissions,
    gradeSubmission, addAssignment, deleteAssignment
  } = useLms();

  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'assignments'
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Grading Modal State
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [viewingFileSubmission, setViewingFileSubmission] = useState(null);

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [newPassingMarks, setNewPassingMarks] = useState(70);
  const [newInstructions, setNewInstructions] = useState('');
  const [newFormats, setNewFormats] = useState('PDF, DOC, DOCX, ZIP');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const attachmentInputRef = useRef(null);

  // Metrics
  const totalSubs = submissions.length;
  const pendingSubs = submissions.filter(s => s.status === 'Pending' || !s.grade).length;
  const gradedSubs = submissions.filter(s => s.status === 'Graded').length;
  const avgGrade = gradedSubs > 0
    ? Math.round(submissions.filter(s => s.status === 'Graded').reduce((acc, s) => acc + (s.grade || 0), 0) / gradedSubs)
    : 0;

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (courseFilter !== 'All' && sub.courseId !== courseFilter) return false;
      if (statusFilter !== 'All' && sub.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const assignment = assignments.find(a => a.id === sub.assignmentId);
        const course = courses.find(c => c.id === sub.courseId);
        return (
          sub.userName.toLowerCase().includes(q) ||
          sub.userEmail.toLowerCase().includes(q) ||
          assignment?.title.toLowerCase().includes(q) ||
          course?.title.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }, [submissions, assignments, courses, courseFilter, statusFilter, search]);

  const openGradingModal = (sub) => {
    setCurrentSubmission(sub);
    setGradeScore(sub.grade !== null && sub.grade !== undefined ? sub.grade : '');
    setGradeFeedback(sub.feedback || '');
    setGradeError('');
    setGradingModalOpen(true);
  };

  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (gradeScore === '' || isNaN(gradeScore)) {
      setGradeError('Please enter a valid numeric grade.');
      return;
    }
    const targetAssignment = assignments.find(a => a.id === currentSubmission.assignmentId);
    const max = targetAssignment?.maxMarks || 100;
    const num = Number(gradeScore);
    if (num < 0 || num > max) {
      setGradeError(`Grade must be between 0 and ${max}.`);
      return;
    }

    gradeSubmission(currentSubmission.id, {
      grade: num,
      feedback: gradeFeedback.trim()
    });

    setGradingModalOpen(false);
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
    }
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addAssignment({
      courseId: newCourseId,
      title: newTitle.trim(),
      description: newDescription.trim(),
      deadline: newDeadline ? new Date(newDeadline).toISOString() : null,
      maxMarks: Number(newMaxMarks) || 100,
      passingMarks: Number(newPassingMarks) || 70,
      allowedFormats: newFormats.split(',').map(f => f.trim().toUpperCase()).filter(Boolean),
      instructions: newInstructions.trim(),
      attachmentFileName: attachmentFile ? attachmentFile.name : null,
      attachmentFileSize: attachmentFile ? `${(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB` : null,
    });

    setCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewDeadline('');
    setNewInstructions('');
    setAttachmentFile(null);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Assignments & Grading</h1>
          <p>Review student project submissions, issue grading scores, and manage deadlines</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={() => setCreateModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <span className="metric-label">Total Submissions</span>
          <div className="metric-value">{totalSubs}</div>
          <span className="metric-subtext">Across all active courses</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Needs Grading</span>
          <div className="metric-value" style={{ color: pendingSubs > 0 ? '#f39c12' : 'var(--text-primary)' }}>
            {pendingSubs}
          </div>
          <span className="metric-subtext">Pending instructor evaluation</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Average Cohort Score</span>
          <div className="metric-value" style={{ color: 'var(--emerald)' }}>
            {avgGrade > 0 ? `${avgGrade}%` : '—'}
          </div>
          <span className="metric-subtext">From {gradedSubs} graded projects</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: 'var(--border-subtle)', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('submissions')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'submissions' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'submissions' ? 'var(--cyan)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <FileText size={16} /> Submissions ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'assignments' ? '2px solid var(--cyan)' : '2px solid transparent',
            color: activeTab === 'assignments' ? 'var(--cyan)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Calendar size={16} /> Assignment Library ({assignments.length})
        </button>
      </div>

      {activeTab === 'submissions' && (
        <div className="data-table-container">
          {/* Filters Bar Toolbar */}
          <div className="table-filter-bar">
            <div className="input-with-icon" style={{ flex: '1 1 260px', minWidth: 200, maxWidth: 380 }}>
              <Search className="input-icon" size={16} />
              <input
                type="text"
                className="input"
                placeholder="Search student, email, or assignment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="input"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 170 }}
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 150 }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Evaluation</option>
              <option value="Graded">Graded</option>
              <option value="Late">Late Submission</option>
            </select>

            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              Showing <strong>{filteredSubmissions.length}</strong> submission{filteredSubmissions.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Submissions Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '22%', minWidth: 200 }}>Student</th>
                  <th style={{ width: '25%', minWidth: 220 }}>Assignment & Course</th>
                  <th style={{ width: '18%', minWidth: 180 }}>Submitted File</th>
                  <th style={{ width: '15%', minWidth: 150 }}>Submission Date</th>
                  <th style={{ width: '10%', minWidth: 100 }}>Status</th>
                  <th style={{ width: '10%', minWidth: 90 }}>Grade</th>
                  <th style={{ width: '10%', minWidth: 110, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => {
                    const assignment = assignments.find(a => a.id === sub.assignmentId);
                    const course = courses.find(c => c.id === sub.courseId);
                    return (
                      <tr key={sub.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--cyan), #17283b)',
                              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 13, fontWeight: 700, flexShrink: 0
                            }}>
                              {sub.userName ? sub.userName[0] : 'S'}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                                {sub.userName}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {sub.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                              {assignment?.title || 'Unknown Assignment'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {course?.title || 'Unknown Course'}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                            onClick={() => setViewingFileSubmission(sub)}
                            title="Click to preview submitted document"
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 6,
                              background: 'rgba(31, 187, 210, 0.12)', color: 'var(--cyan)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <FileText size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sub.fileName}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {sub.fileSize} • <span style={{ color: 'var(--cyan)', textDecoration: 'underline' }}>Preview</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(sub.submittedAt)}
                        </td>

                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: sub.status === 'Graded'
                              ? 'rgba(31, 187, 210, 0.15)'
                              : (sub.status === 'Late' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(243, 156, 18, 0.15)'),
                            color: sub.status === 'Graded'
                              ? 'var(--cyan)'
                              : (sub.status === 'Late' ? 'var(--red)' : 'var(--amber)'),
                            border: sub.status === 'Graded'
                              ? '1px solid rgba(31, 187, 210, 0.3)'
                              : (sub.status === 'Late' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(243, 156, 18, 0.3)')
                          }}>
                            {sub.status === 'Graded' && <CheckCircle2 size={12} />}
                            {sub.status === 'Late' && <Clock size={12} />}
                            {sub.status}
                          </span>
                        </td>

                        <td>
                          {sub.status === 'Graded' ? (
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                              <span style={{ color: 'var(--cyan)' }}>{sub.grade}</span> / {assignment?.maxMarks || 100}
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => openGradingModal(sub)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: 12,
                              padding: '5px 12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              borderRadius: 'var(--radius-full)'
                            }}
                          >
                            <Edit3 size={13} /> {sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
                      <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No assignment submissions match your search.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {assignments.map((assign) => {
            const course = courses.find(c => c.id === assign.courseId);
            const assignSubs = submissions.filter(s => s.assignmentId === assign.id);
            const pendingCount = assignSubs.filter(s => s.status !== 'Graded').length;

            return (
              <div
                key={assign.id}
                style={{
                  background: 'var(--glass-surface-light)',
                  border: 'var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px',
                      borderRadius: 4, background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)'
                    }}>
                      {course?.title || 'Course'}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this assignment?')) {
                          deleteAssignment(assign.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title="Delete assignment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '6px 0 10px', color: 'var(--text-primary)' }}>
                    {assign.title}
                  </h3>

                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                    {assign.description}
                  </p>

                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                    <span>Max: <strong>{assign.maxMarks} pts</strong></span>
                    <span>Passing: <strong>{assign.passingMarks} pts</strong></span>
                    <span>Due: <strong>{formatDate(assign.deadline)}</strong></span>
                  </div>
                </div>

                <div style={{
                  paddingTop: 12,
                  borderTop: 'var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {assignSubs.length} Submissions ({pendingCount} pending)
                  </span>
                  <button
                    onClick={() => {
                      setCourseFilter(assign.courseId);
                      setActiveTab('submissions');
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12 }}
                  >
                    View Submissions →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grading Modal */}
      {gradingModalOpen && currentSubmission && (
        <div className="modal-overlay" onClick={() => setGradingModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} style={{ color: 'var(--cyan)' }} />
                Grade Student Submission
              </h3>
              <button onClick={() => setGradingModalOpen(false)} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGrade}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Student Info Card */}
                <div style={{
                  padding: 14,
                  background: 'var(--glass-surface-light)',
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                      {currentSubmission.userName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {currentSubmission.userEmail}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Submitted</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDate(currentSubmission.submittedAt)}</div>
                  </div>
                </div>

                {/* Submitted File Info */}
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--glass-surface)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} style={{ color: 'var(--cyan)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{currentSubmission.fileName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({currentSubmission.fileSize})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingFileSubmission(currentSubmission)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Eye size={14} /> View File
                  </button>
                </div>

                {currentSubmission.notes && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Student Note:
                    </label>
                    <div style={{ padding: 10, background: 'var(--glass-surface)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                      "{currentSubmission.notes}"
                    </div>
                  </div>
                )}

                {/* Score Input */}
                <div>
                  {(() => {
                    const assign = assignments.find(a => a.id === currentSubmission.assignmentId);
                    const maxMarks = assign?.maxMarks || 100;
                    return (
                      <>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                          Score (out of {maxMarks} points):
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="number"
                            className="input"
                            min="0"
                            max={maxMarks}
                            value={gradeScore}
                            onChange={(e) => setGradeScore(e.target.value)}
                            placeholder={`e.g. 92`}
                            style={{ width: 120, fontSize: 16, fontWeight: 700 }}
                            required
                          />
                          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {maxMarks}</span>
                          {gradeScore !== '' && !isNaN(gradeScore) && (
                            <span style={{
                              marginLeft: 'auto',
                              fontSize: 13,
                              fontWeight: 700,
                              color: Number(gradeScore) >= (assign?.passingMarks || 70) ? 'var(--emerald)' : '#ef4444'
                            }}>
                              {Math.round((Number(gradeScore) / maxMarks) * 100)}% ({Number(gradeScore) >= (assign?.passingMarks || 70) ? 'Passed' : 'Needs Revision'})
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Instructor Feedback & Recommendations:
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Highlight strengths, point out edge cases, or recommend next steps..."
                    style={{ width: '100%', fontSize: 13, lineHeight: 1.5 }}
                  />
                </div>

                {gradeError && (
                  <div style={{ color: '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> {gradeError}
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setGradingModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={16} /> Save Grade & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 620, borderRadius: 14 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                <Plus size={20} style={{ color: 'var(--cyan)' }} />
                Create New Assignment
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>
                {/* Select Course */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Select Course:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="input"
                      value={newCourseId}
                      onChange={(e) => setNewCourseId(e.target.value)}
                      style={{
                        width: '100%',
                        appearance: 'none',
                        paddingRight: 36,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        background: 'var(--glass-surface, #ffffff)',
                        border: '1px solid rgba(23, 40, 59, 0.15)'
                      }}
                      required
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id} style={{ color: '#0f172a', background: '#ffffff' }}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                {/* Assignment Title */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Assignment Title:
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Capstone Architecture Blueprint"
                    style={{ width: '100%', fontSize: 13.5, color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                {/* Project Prompt / Description */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Project Prompt / Description:
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe what students need to accomplish, key deliverables, and evaluation criteria..."
                    style={{ width: '100%', minHeight: 84, fontSize: 13.5, color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                {/* File Attachment Dropzone for Reference/Brief */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Attach Assignment Brief / Specification File:
                  </label>
                  <input
                    type="file"
                    ref={attachmentInputRef}
                    onChange={handleAttachmentChange}
                    accept=".pdf,.doc,.docx,.msword,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => attachmentInputRef.current?.click()}
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: attachmentFile ? '1.5px solid var(--cyan)' : '1.5px dashed rgba(31, 187, 210, 0.4)',
                      background: attachmentFile ? 'rgba(31, 187, 210, 0.08)' : 'var(--glass-surface-light, #f8fafc)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Upload size={24} style={{ color: 'var(--cyan)', margin: '0 auto 6px' }} />
                    {attachmentFile ? (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                          Attached: {attachmentFile.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                          Upload assignment brief (PDF, DOC, DOCX / MS Word, ZIP)
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          Students will be able to download this file when reviewing requirements
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Max Points & Passing Points */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Max Points:
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={newMaxMarks}
                      onChange={(e) => setNewMaxMarks(e.target.value)}
                      placeholder="100"
                      style={{ width: '100%', fontSize: 13.5, color: 'var(--text-primary)' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Passing Points:
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={newPassingMarks}
                      onChange={(e) => setNewPassingMarks(e.target.value)}
                      placeholder="70"
                      style={{ width: '100%', fontSize: 13.5, color: 'var(--text-primary)' }}
                      required
                    />
                  </div>
                </div>

                {/* Submission Deadline & Allowed Formats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Submission Deadline:
                    </label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      style={{ width: '100%', fontSize: 13, color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Allowed Formats:
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={newFormats}
                      onChange={(e) => setNewFormats(e.target.value)}
                      placeholder="PDF, DOC, DOCX, ZIP"
                      style={{ width: '100%', fontSize: 13, color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Special Submission Instructions (Optional):
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    placeholder="e.g. Include student name in header, max 20 pages"
                    style={{ width: '100%', fontSize: 13, color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                >
                  <Plus size={16} /> Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Document Viewer Modal for inspecting submitted assignments */}
      <DocumentViewerModal
        isOpen={!!viewingFileSubmission}
        onClose={() => setViewingFileSubmission(null)}
        file={viewingFileSubmission}
      />
    </div>
  );
}
