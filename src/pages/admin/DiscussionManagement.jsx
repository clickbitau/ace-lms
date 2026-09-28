import { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  MessageSquare, Search, Filter, CheckCircle2, ShieldCheck,
  Trash2, ThumbsUp, Send, CornerDownRight, X, Pin, Sparkles, BookOpen, Clock
} from 'lucide-react';

export default function DiscussionManagement() {
  const {
    currentUser,
    courses,
    discussions,
    discussionReplies,
    getRepliesForDiscussion,
    addReply,
    markDiscussionResolved,
    toggleInstructorEndorsement,
    deleteQuestion,
    deleteReply,
  } = useLms();

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unanswered' | 'resolved'
  const [activeReplyModal, setActiveReplyModal] = useState(null); // question object
  const [replyText, setReplyText] = useState('');

  // Stats calculation
  const stats = useMemo(() => {
    const total = (discussions || []).length;
    const unanswered = (discussions || []).filter(d => (d.replyCount || 0) === 0).length;
    const resolved = (discussions || []).filter(d => d.isResolved).length;
    const endorsed = (discussionReplies || []).filter(r => r.isInstructorEndorsed).length;
    return { total, unanswered, resolved, endorsed };
  }, [discussions, discussionReplies]);

  // Filtered discussions list
  const filtered = useMemo(() => {
    return (discussions || []).filter(d => {
      const course = courses.find(c => c.id === d.courseId);
      // Course filter
      if (courseFilter !== 'all' && d.courseId !== courseFilter) return false;
      // Status filter
      if (statusFilter === 'unanswered' && (d.replyCount || 0) > 0) return false;
      if (statusFilter === 'resolved' && !d.isResolved) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        const titleMatch = (d.title || '').toLowerCase().includes(q);
        const contentMatch = (d.content || '').toLowerCase().includes(q);
        const authorMatch = (d.userName || '').toLowerCase().includes(q);
        const courseMatch = (course?.title || '').toLowerCase().includes(q);
        if (!titleMatch && !contentMatch && !authorMatch && !courseMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [discussions, courses, courseFilter, statusFilter, search]);

  const handleOpenReplyModal = (question) => {
    setActiveReplyModal(question);
    setReplyText('');
  };

  const handleSendInstructorReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeReplyModal) return;

    addReply({
      discussionId: activeReplyModal.id,
      content: replyText.trim(),
    });

    setReplyText('');
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Q&A & Discussion Moderation</h1>
          <p>Review student questions, provide verified instructor responses, endorse peer answers, and maintain curriculum quality.</p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="stat-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon cyan"><MessageSquare size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Questions</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Across all courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><MessageSquare size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Awaiting Reply</div>
            <div className="stat-value" style={{ color: stats.unanswered > 0 ? '#f39c12' : 'inherit' }}>
              {stats.unanswered}
            </div>
            <div className="stat-label">Needs instructor answer</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Resolved Threads</div>
            <div className="stat-value" style={{ color: 'var(--emerald)' }}>{stats.resolved}</div>
            <div className="stat-label">Questions answered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan"><ShieldCheck size={22} /></div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Endorsed Answers</div>
            <div className="stat-value">{stats.endorsed}</div>
            <div className="stat-label">Verified instructor marks</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {/* Discussions Data Table Container */}
      <div className="data-table-container">
        {/* Filters Bar Toolbar */}
        <div className="table-filter-bar">
          <div className="input-with-icon" style={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search discussions by topic, student name, or course..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="input"
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 180 }}
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <select
              className="input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 170 }}
            >
              <option value="all">All Statuses</option>
              <option value="unanswered">Awaiting Reply (0 replies)</option>
              <option value="resolved">Resolved Questions</option>
            </select>
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> question{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Discussions Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '38%', minWidth: 260 }}>Question & Course</th>
                <th style={{ width: '22%', minWidth: 180 }}>Student Author</th>
                <th style={{ width: '15%', minWidth: 120 }}>Engagement</th>
                <th style={{ width: '12%', minWidth: 100 }}>Status</th>
                <th style={{ width: '13%', minWidth: 110, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(q => {
                const course = courses.find(c => c.id === q.courseId);
                const replies = getRepliesForDiscussion(q.id);

                return (
                  <tr key={q.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span className="badge badge-draft" style={{ fontSize: 10, padding: '2px 6px' }}>
                          {course?.title || 'Course'}
                        </span>
                        {q.isPinned && (
                          <span className="badge" style={{ fontSize: 10, background: 'rgba(243, 156, 18, 0.15)', color: 'var(--amber)' }}>
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {q.title}
                      </div>
                      <div style={{
                        fontSize: 12, color: 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4
                      }}>
                        {q.content}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {q.userName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatDate(q.createdAt)}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                          <ThumbsUp size={12} style={{ color: 'var(--cyan)' }} /> {q.upvotes || 0}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                          <MessageSquare size={12} style={{ color: '#f39c12' }} /> {replies.length}
                        </span>
                      </div>
                    </td>

                    <td>
                      {q.isResolved ? (
                        <span className="badge badge-active" style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                      ) : (
                        <span className="badge badge-draft" style={{ fontSize: 11, background: replies.length === 0 ? 'rgba(243, 156, 18, 0.15)' : undefined, color: replies.length === 0 ? '#f39c12' : undefined }}>
                          {replies.length === 0 ? 'Needs Reply' : 'Open'}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReplyModal(q)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                        >
                          <Send size={12} /> Reply ({replies.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => markDiscussionResolved(q.id, !q.isResolved)}
                          className="btn btn-secondary btn-sm"
                          title={q.isResolved ? 'Mark as Open' : 'Mark as Resolved'}
                          style={{ padding: '4px 8px' }}
                        >
                          <CheckCircle2 size={13} style={{ color: q.isResolved ? 'var(--text-muted)' : 'var(--emerald)' }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteQuestion(q.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Delete Thread"
                          style={{ color: 'var(--red)', padding: 4 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>No discussion threads matching criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Reply Modal */}
      {activeReplyModal && (
        <div className="modal-backdrop" onClick={() => setActiveReplyModal(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 740, borderRadius: 16 }}>
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(31, 187, 210, 0.12)',
                  color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MessageSquare size={19} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Instructor Reply & Moderation
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>Author: <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeReplyModal.userName}</strong></span>
                    <span>•</span>
                    <span style={{ whiteSpace: 'nowrap' }}>Posted {formatDate(activeReplyModal.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setActiveReplyModal(null)} title="Close dialog">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '24px' }}>
              {/* Question Card */}
              <div style={{
                padding: '18px 20px',
                background: 'var(--glass-surface-light, #f8fafc)',
                borderRadius: 12,
                border: '1px solid rgba(23, 40, 59, 0.1)',
                borderLeft: '4px solid var(--cyan)',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-active" style={{ fontSize: 11, padding: '3px 8px' }}>
                      {courses.find(c => c.id === activeReplyModal.courseId)?.title || 'Course Q&A'}
                    </span>
                    {activeReplyModal.isPinned && (
                      <span className="badge" style={{ fontSize: 11, background: 'rgba(243, 156, 18, 0.15)', color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Pin size={11} /> Pinned
                      </span>
                    )}
                    {activeReplyModal.isResolved ? (
                      <span className="badge badge-active" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={11} /> Resolved
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: 11, background: 'rgba(243, 156, 18, 0.12)', color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> Open Question
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(activeReplyModal.createdAt)}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {activeReplyModal.title}
                </h4>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {activeReplyModal.content}
                </p>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
                  paddingTop: 12, borderTop: '1px solid rgba(23, 40, 59, 0.06)'
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--cyan), #17283b)',
                    color: '#ffffff', fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {getInitials(activeReplyModal.userName)}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Asked by <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeReplyModal.userName}</strong>
                  </span>
                </div>
              </div>

              {/* Existing Replies List */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>
                  Thread Replies ({getRepliesForDiscussion(activeReplyModal.id).length})
                </h4>
                {getRepliesForDiscussion(activeReplyModal.id).some(r => r.isInstructorEndorsed) && (
                  <span style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={13} /> Contains Endorsed Answer
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {getRepliesForDiscussion(activeReplyModal.id).length > 0 ? (
                  getRepliesForDiscussion(activeReplyModal.id).map(r => (
                    <div
                      key={r.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: 12,
                        background: r.isInstructorEndorsed
                          ? 'rgba(31, 187, 210, 0.05)'
                          : 'var(--glass-surface-light, #f8fafc)',
                        border: r.isInstructorEndorsed
                          ? '1px solid rgba(31, 187, 210, 0.3)'
                          : '1px solid rgba(23, 40, 59, 0.09)',
                        borderLeft: r.isInstructorEndorsed ? '4px solid var(--cyan)' : '1px solid rgba(23, 40, 59, 0.09)',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap'
                      }}>
                        {/* Author info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: r.isInstructorEndorsed
                              ? 'linear-gradient(135deg, var(--cyan), #17283b)'
                              : 'linear-gradient(135deg, #475569, #1e293b)',
                            color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12, flexShrink: 0
                          }}>
                            {getInitials(r.userName)}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                {r.userName}
                              </span>

                              {r.isInstructorEndorsed && (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                                  background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)',
                                  border: '1px solid rgba(31, 187, 210, 0.3)', whiteSpace: 'nowrap'
                                }}>
                                  <ShieldCheck size={12} /> Endorsed Answer
                                </span>
                              )}
                            </div>

                            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {formatDate(r.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => toggleInstructorEndorsement(r.id)}
                            className="btn btn-sm"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 600,
                              padding: '5px 10px',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              whiteSpace: 'nowrap',
                              color: r.isInstructorEndorsed ? 'var(--cyan)' : 'var(--text-secondary)',
                              background: r.isInstructorEndorsed ? 'rgba(31, 187, 210, 0.1)' : 'rgba(23, 40, 59, 0.05)',
                              border: r.isInstructorEndorsed ? '1px solid rgba(31, 187, 210, 0.3)' : '1px solid rgba(23, 40, 59, 0.12)'
                            }}
                          >
                            <Sparkles size={13} style={{ color: r.isInstructorEndorsed ? 'var(--cyan)' : 'var(--amber)' }} />
                            <span>{r.isInstructorEndorsed ? 'Remove Endorsement' : 'Endorse Answer'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteReply(r.id)}
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--red)', width: 30, height: 30, borderRadius: 6 }}
                            title="Delete reply"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p style={{
                        margin: '12px 0 0 0',
                        fontSize: 13.5,
                        color: 'var(--text-primary)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line'
                      }}>
                        {r.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center', padding: '24px 16px',
                    color: 'var(--text-muted)', fontSize: 13,
                    background: 'var(--glass-surface-light, #f8fafc)',
                    borderRadius: 10, border: '1px dashed rgba(23, 40, 59, 0.15)'
                  }}>
                    <MessageSquare size={24} style={{ margin: '0 auto 6px', opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>No student replies yet. Write the first official instructor answer below!</p>
                  </div>
                )}
              </div>

              {/* Compose Instructor Reply Form */}
              <form onSubmit={handleSendInstructorReply}>
                <div style={{
                  background: 'var(--glass-surface-light, #f8fafc)',
                  border: '1px solid rgba(23, 40, 59, 0.1)',
                  borderRadius: 12,
                  padding: '16px 18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <MessageSquare size={15} style={{ color: 'var(--cyan)' }} />
                      Post Official Instructor Answer
                    </label>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--cyan)',
                      background: 'rgba(31, 187, 210, 0.1)',
                      padding: '3px 8px', borderRadius: 9999,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      whiteSpace: 'nowrap'
                    }}>
                      <ShieldCheck size={12} /> Will post with Instructor badge
                    </span>
                  </div>

                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Type verified explanation, architectural guidance, or links to external references..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: 96,
                      resize: 'vertical',
                      marginBottom: 12,
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'var(--glass-surface, #ffffff)',
                      border: '1px solid rgba(23, 40, 59, 0.15)'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => markDiscussionResolved(activeReplyModal.id, !activeReplyModal.isResolved)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <CheckCircle2 size={13} style={{ color: activeReplyModal.isResolved ? 'var(--amber)' : 'var(--emerald)' }} />
                      {activeReplyModal.isResolved ? 'Re-open Question' : 'Mark as Resolved'}
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={!replyText.trim()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 18px', fontWeight: 600
                      }}
                    >
                      <Send size={13} /> Post Answer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
