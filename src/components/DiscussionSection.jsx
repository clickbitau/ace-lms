import { useState, useMemo } from 'react';
import { useLms } from '../context/LmsContext';
import {
  MessageSquare, ThumbsUp, CheckCircle2, Pin, Search,
  Send, Trash2, ShieldCheck, ChevronDown, ChevronUp,
  Plus, Filter, AlertCircle, CornerDownRight, Sparkles
} from 'lucide-react';

export default function DiscussionSection({ courseId, lessonId, lessonTitle = 'This Lesson' }) {
  const {
    currentUser,
    getDiscussionsForLesson,
    getDiscussionsForCourse,
    getRepliesForDiscussion,
    addQuestion,
    addReply,
    toggleUpvoteQuestion,
    toggleUpvoteReply,
    markDiscussionResolved,
    toggleInstructorEndorsement,
    deleteQuestion,
    deleteReply,
  } = useLms();

  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' | 'lesson'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'unresolved' | 'top' | 'mine'
  const [showAskForm, setShowAskForm] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState(new Set()); // discussionIds
  const [replyInputs, setReplyInputs] = useState({}); // { [discussionId]: string }

  // New question form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch relevant questions
  const allCourseQuestions = getDiscussionsForCourse(courseId) || [];
  const lessonQuestions = lessonId
    ? getDiscussionsForLesson(lessonId)
    : allCourseQuestions;

  // If user chooses 'lesson' and has lessonId, show lesson questions; otherwise show all course questions
  const questions = (scopeFilter === 'lesson' && lessonId)
    ? lessonQuestions
    : allCourseQuestions;

  const toggleThread = (discId) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      next.has(discId) ? next.delete(discId) : next.add(discId);
      return next;
    });
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter a concise question title.');
      return;
    }
    if (!newContent.trim()) {
      setFormError('Please describe your question or issue in detail.');
      return;
    }

    const created = addQuestion({
      courseId,
      lessonId,
      title: newTitle.trim(),
      content: newContent.trim(),
    });

    setNewTitle('');
    setNewContent('');
    setFormError('');
    setShowAskForm(false);
    // Expand newly created question
    setExpandedThreads(prev => new Set([...prev, created.id]));
  };

  const handleSendReply = (discussionId) => {
    const text = replyInputs[discussionId];
    if (!text || !text.trim()) return;

    addReply({
      discussionId,
      content: text.trim(),
    });

    setReplyInputs(prev => ({ ...prev, [discussionId]: '' }));
    // Ensure thread is expanded
    setExpandedThreads(prev => new Set([...prev, discussionId]));
  };

  const isInstructor = currentUser.role === 'Admin' || currentUser.role === 'Instructor';

  // Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filterMode === 'unresolved' && q.isResolved) return false;
      if (filterMode === 'mine' && q.userId !== currentUser.id) return false;
      if (search) {
        const query = search.toLowerCase();
        const titleMatch = (q.title || '').toLowerCase().includes(query);
        const contentMatch = (q.content || '').toLowerCase().includes(query);
        const authorMatch = (q.userName || '').toLowerCase().includes(query);
        if (!titleMatch && !contentMatch && !authorMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (filterMode === 'top') {
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [questions, filterMode, search, currentUser.id]);

  const formatDate = (iso) => {
    if (!iso) return 'Recently';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="discussion-section" style={{ marginTop: 24 }}>
      {/* Top Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14, marginBottom: 20
      }}>
        <div>
          <h3 style={{
            fontSize: 18, fontWeight: 700, margin: '0 0 4px 0',
            display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)'
          }}>
            <MessageSquare size={20} style={{ color: 'var(--cyan)' }} />
            Q&A & Discussion Forum
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Ask questions, collaborate with peers, and receive verified answers from instructors.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAskForm(!showAskForm)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          {showAskForm ? 'Cancel' : <><Plus size={15} /> Ask a Question</>}
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <form onSubmit={handleAskQuestion} className="glass-card-static" style={{
          padding: '20px', marginBottom: 24, border: '1px solid rgba(31, 187, 210, 0.4)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 15, color: 'var(--cyan)', fontWeight: 700 }}>
            Post a Question to {lessonTitle}
          </h4>

          {formError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444', fontSize: 12, marginBottom: 12
            }}>
              <AlertCircle size={16} /> {formError}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Question Title / Summary
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. How does token expiration work with asynchronous requests?"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Details & Context
            </label>
            <textarea
              className="input"
              rows={4}
              placeholder="Provide background context, error messages, code snippets, or what you've tried so far..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAskForm(false)}>
              Discard
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={13} /> Post Question
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 20,
        padding: '10px 14px', background: 'var(--glass-surface)',
        borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            className={`btn btn-sm ${scopeFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              fontSize: 11, padding: '4px 10px',
              borderColor: scopeFilter === 'all' ? 'var(--cyan)' : undefined,
              color: scopeFilter === 'all' ? 'var(--cyan)' : undefined,
              fontWeight: 700
            }}
          >
            All Course Q&A ({allCourseQuestions.length})
          </button>
          {lessonId && (
            <button
              type="button"
              onClick={() => setScopeFilter('lesson')}
              className={`btn btn-sm ${scopeFilter === 'lesson' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{
                fontSize: 11, padding: '4px 10px',
                borderColor: scopeFilter === 'lesson' ? 'var(--cyan)' : undefined,
                color: scopeFilter === 'lesson' ? 'var(--cyan)' : undefined,
                fontWeight: 700
              }}
            >
              This Lesson ({lessonQuestions.length})
            </button>
          )}
          <span style={{ width: 1, height: 18, background: 'var(--border-subtle)', margin: '0 4px' }} />
          {[
            { id: 'all', label: 'All' },
            { id: 'unresolved', label: 'Unresolved' },
            { id: 'top', label: 'Top Upvoted' },
            { id: 'mine', label: 'My Questions' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterMode(f.id)}
              className={`btn btn-sm ${filterMode === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '4px 10px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="input-with-icon" style={{ minWidth: 220, maxWidth: 320, flex: 1 }}>
          <Search className="input-icon" size={14} />
          <input
            type="text"
            className="input input-sm"
            placeholder="Search discussions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => {
            const replies = getRepliesForDiscussion(q.id);
            const isExpanded = expandedThreads.has(q.id);
            const hasUpvoted = (q.upvotedBy || []).includes(currentUser.id);
            const isOwner = q.userId === currentUser.id;

            return (
              <div
                key={q.id}
                className="glass-card-static"
                style={{
                  padding: '18px 20px',
                  border: q.isPinned ? '1px solid rgba(243, 156, 18, 0.4)' : 'var(--border-subtle)',
                  background: q.isPinned ? 'rgba(243, 156, 18, 0.03)' : 'var(--glass-surface)',
                }}
              >
                {/* Header row: Author + Meta + Pin Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: q.userRole === 'Admin' || q.userRole === 'Instructor'
                        ? 'linear-gradient(135deg, var(--amber), #e11d48)'
                        : 'linear-gradient(135deg, var(--cyan), var(--navy))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 700
                    }}>
                      {q.userName.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {q.userName}
                        </span>
                        {q.userRole === 'Admin' || q.userRole === 'Instructor' ? (
                          <span className="badge" style={{ fontSize: 10, background: 'rgba(243, 156, 18, 0.15)', color: 'var(--amber)', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
                            Instructor
                          </span>
                        ) : null}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          • {formatDate(q.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {q.isPinned && (
                      <span className="badge" style={{ fontSize: 10, background: 'rgba(243, 156, 18, 0.15)', color: 'var(--amber)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Pin size={10} /> Pinned
                      </span>
                    )}

                    {q.isResolved ? (
                      <span className="badge badge-active" style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
                        <CheckCircle2 size={12} /> Resolved
                      </span>
                    ) : (
                      <span className="badge badge-draft" style={{ fontSize: 11 }}>
                        Open
                      </span>
                    )}

                    {(isInstructor || isOwner) && (
                      <button
                        type="button"
                        onClick={() => deleteQuestion(q.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Delete Question"
                        style={{ color: 'var(--text-muted)', padding: 4 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Title & Content */}
                <h4 style={{
                  fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                  margin: '0 0 6px 0', lineHeight: 1.4
                }}>
                  {q.title}
                </h4>
                <p style={{
                  fontSize: 13, color: 'var(--text-secondary)',
                  margin: '0 0 14px 0', lineHeight: 1.6, whiteSpace: 'pre-line'
                }}>
                  {q.content}
                </p>

                {/* Footer Controls: Upvote + Reply Accordion Toggle + Resolve action */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 10, paddingTop: 10, borderTop: 'var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Upvote button */}
                    <button
                      type="button"
                      onClick={() => toggleUpvoteQuestion(q.id)}
                      className={`btn btn-sm ${hasUpvoted ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px' }}
                    >
                      <ThumbsUp size={12} />
                      <span>{q.upvotes || 0} Upvotes</span>
                    </button>

                    {/* Toggle Replies button */}
                    <button
                      type="button"
                      onClick={() => toggleThread(q.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--cyan)' }}
                    >
                      <MessageSquare size={13} />
                      <span>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {(isInstructor || isOwner) && (
                      <button
                        type="button"
                        onClick={() => markDiscussionResolved(q.id, !q.isResolved)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, color: q.isResolved ? 'var(--text-muted)' : 'var(--emerald)' }}
                      >
                        <CheckCircle2 size={13} /> {q.isResolved ? 'Re-open Question' : 'Mark as Resolved'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Replies Thread */}
                {isExpanded && (
                  <div style={{
                    marginTop: 16, paddingTop: 14,
                    borderTop: '1px dashed rgba(255,255,255,0.08)',
                    display: 'flex', flexDirection: 'column', gap: 12
                  }}>
                    {replies.length > 0 ? (
                      replies.map(r => {
                        const hasReplyUpvoted = (r.upvotedBy || []).includes(currentUser.id);
                        const isReplyAuthor = r.userId === currentUser.id;

                        return (
                          <div
                            key={r.id}
                            style={{
                              padding: '12px 14px', borderRadius: 'var(--radius-md)',
                              background: r.isInstructorEndorsed ? 'rgba(31, 187, 210, 0.05)' : 'rgba(255,255,255,0.02)',
                              border: r.isInstructorEndorsed ? '1px solid rgba(31, 187, 210, 0.3)' : 'var(--border-subtle)',
                              marginLeft: 16
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <div style={{
                                  width: 24, height: 24, borderRadius: '50%',
                                  background: r.userRole === 'Admin' || r.userRole === 'Instructor'
                                    ? 'var(--amber)'
                                    : 'var(--cyan)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#000', fontSize: 10, fontWeight: 700, flexShrink: 0
                                }}>
                                  {(r.userName || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) || 'U'}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                                  {r.userName}
                                </span>

                                {r.isInstructorEndorsed && (
                                  <span className="badge" style={{
                                    fontSize: 10, background: 'rgba(31, 187, 210, 0.2)', color: 'var(--cyan)',
                                    display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid rgba(31, 187, 210, 0.4)',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    <ShieldCheck size={11} /> Endorsed Answer
                                  </span>
                                )}

                                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  • {formatDate(r.createdAt)}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {isInstructor && (
                                  <button
                                    type="button"
                                    onClick={() => toggleInstructorEndorsement(r.id)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontSize: 10, padding: '2px 6px', color: r.isInstructorEndorsed ? 'var(--cyan)' : 'var(--text-muted)' }}
                                    title="Toggle instructor endorsement badge"
                                  >
                                    <Sparkles size={11} /> {r.isInstructorEndorsed ? 'Endorsed' : 'Endorse'}
                                  </button>
                                )}

                                {(isInstructor || isReplyAuthor) && (
                                  <button
                                    type="button"
                                    onClick={() => deleteReply(r.id)}
                                    className="btn btn-ghost btn-icon btn-sm"
                                    style={{ color: 'var(--text-muted)', padding: 2 }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p style={{ margin: '0 0 8px 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                              {r.content}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => toggleUpvoteReply(r.id)}
                                className="btn btn-ghost btn-sm"
                                style={{
                                  fontSize: 10, padding: '2px 8px',
                                  color: hasReplyUpvoted ? 'var(--cyan)' : 'var(--text-muted)'
                                }}
                              >
                                <ThumbsUp size={10} /> {r.upvotes || 0} Upvotes
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0 6px 16px' }}>
                        No replies yet. Be the first to help answer!
                      </div>
                    )}

                    {/* Quick Reply Form */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, marginLeft: 16 }}>
                      <input
                        type="text"
                        className="input input-sm"
                        placeholder="Write a constructive reply..."
                        value={replyInputs[q.id] || ''}
                        onChange={e => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendReply(q.id);
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendReply(q.id)}
                        style={{ padding: '0 12px' }}
                      >
                        <Send size={12} /> Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="glass-card-static" style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>No Discussions Found</h4>
            <p style={{ fontSize: 12, margin: 0 }}>
              {search
                ? `No questions matching "${search}".`
                : 'Have a question or stuck on a concept? Start a new discussion thread above!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
