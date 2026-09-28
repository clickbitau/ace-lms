import { useState, useRef } from 'react';
import { useLms } from '../context/LmsContext';
import DocumentViewerModal from './DocumentViewerModal';
import {
  FileText, Upload, CheckCircle2, Clock, AlertTriangle,
  Download, Calendar, Award, Check, X, MessageSquare, Eye
} from 'lucide-react';

export default function AssignmentCard({ assignment, courseId }) {
  const { currentUser, submitAssignment, getUserSubmissions } = useLms();
  const fileInputRef = useRef(null);

  const userSubmissions = getUserSubmissions(currentUser?.id);
  const submission = userSubmissions.find(s => s.assignmentId === assignment.id);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const now = new Date();
  const deadlineDate = assignment.deadline ? new Date(assignment.deadline) : null;
  const isPastDeadline = deadlineDate && deadlineDate < now;

  const getDaysLeft = () => {
    if (!deadlineDate) return null;
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today!';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension
      const rawExt = file.name.split('.').pop()?.toUpperCase() || '';
      const allowed = (assignment.allowedFormats || ['PDF', 'DOCX', 'DOC', 'ZIP'])
        .flatMap(f => f.toUpperCase().split(',').map(s => s.trim()));

      const isWordMatch = (rawExt === 'DOC' || rawExt === 'DOCX') && 
        allowed.some(a => a.includes('DOC') || a.includes('WORD') || a.includes('DOCX'));
      const isDirectMatch = allowed.includes(rawExt);

      if (!isDirectMatch && !isWordMatch) {
        setErrorMsg(`Format .${rawExt} not allowed. Allowed formats: ${allowed.join(', ')}.`);
        setSelectedFile(null);
        setFileDataUrl(null);
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);

      // Read file into Data URL for preview and inspection
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFileDataUrl(ev.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !submission) {
      setErrorMsg('Please select a file to submit.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      submitAssignment(assignment.id, {
        fileName: selectedFile ? selectedFile.name : submission?.fileName,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : submission?.fileSize,
        fileData: fileDataUrl || submission?.fileData || null,
        fileType: selectedFile?.type || submission?.fileType || 'application/pdf',
        notes: notes || submission?.notes || '',
      });
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setShowUploadForm(false);
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 1000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No deadline';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={{
      background: 'var(--glass-surface-light)',
      border: submission?.status === 'Graded'
        ? '1px solid rgba(16, 185, 129, 0.4)'
        : (isPastDeadline && !submission ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(31, 187, 210, 0.25)'),
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Banner Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(31, 187, 210, 0.15)',
              color: 'var(--cyan)',
              textTransform: 'uppercase'
            }}>
              Assignment
            </span>

            {/* Deadline Pill */}
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: isPastDeadline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(243, 156, 18, 0.15)',
              color: isPastDeadline ? '#ef4444' : '#f39c12',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Clock size={11} /> {getDaysLeft()}
            </span>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 0' }}>
            {assignment.title}
          </h3>
        </div>

        {/* Max Marks & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            textAlign: 'right',
            padding: '6px 14px',
            background: 'var(--glass-surface-hover)',
            borderRadius: 'var(--radius-md)',
            border: 'var(--border-subtle)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max Score</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              {assignment.maxMarks} pts
            </div>
          </div>

          {submission && (
            <span style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: submission.status === 'Graded'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(31, 187, 210, 0.15)',
              color: submission.status === 'Graded' ? 'var(--emerald)' : 'var(--cyan)'
            }}>
              {submission.status === 'Graded' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {submission.status}
            </span>
          )}
        </div>
      </div>

      {/* Description & Requirements */}
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
        {assignment.description}
      </p>

      {assignment.instructions && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--glass-surface)',
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginBottom: 18,
          borderLeft: '3px solid var(--cyan)'
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Instructions: </strong>
          {assignment.instructions}
        </div>
      )}

      {/* Instructor Attached Brief */}
      {assignment.attachmentFileName && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(31, 187, 210, 0.08)',
          border: '1px solid rgba(31, 187, 210, 0.25)',
          marginBottom: 18, flexWrap: 'wrap', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(31, 187, 210, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cyan)'
            }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {assignment.attachmentFileName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Official Project Specification & Requirements • {assignment.attachmentFileSize || 'Reference Doc'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPreviewDoc({
              fileName: assignment.attachmentFileName,
              fileSize: assignment.attachmentFileSize || '1.20 MB',
              notes: `Official coursework brief: ${assignment.title}`,
              studentName: 'Course Instructor'
            })}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <Eye size={13} /> View Brief
          </button>
        </div>
      )}

      {/* Allowed Formats & Deadline details */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={13} /> Due: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(assignment.deadline)}</strong>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <FileText size={13} /> Allowed: <strong style={{ color: 'var(--text-primary)' }}>{assignment.allowedFormats?.join(', ') || 'Any'}</strong>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Award size={13} /> Passing: <strong style={{ color: 'var(--text-primary)' }}>{assignment.passingMarks || 70} pts</strong>
        </span>
      </div>

      {/* Graded Feedback Box */}
      {submission && submission.status === 'Graded' && (
        <div style={{
          padding: 16,
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} /> Grade: {submission.grade} / {assignment.maxMarks} ({Math.round((submission.grade / assignment.maxMarks) * 100)}%)
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Graded by {submission.gradedBy || 'Instructor'} on {formatDate(submission.gradedAt)}
            </span>
          </div>
          {submission.feedback && (
            <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
              "{submission.feedback}"
            </p>
          )}
        </div>
      )}

      {/* Submitted File Info */}
      {submission && !showUploadForm && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'var(--glass-surface)',
          borderRadius: 'var(--radius-md)',
          border: 'var(--border-subtle)',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {submission.fileName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {submission.fileSize} • Submitted on {formatDate(submission.submittedAt)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setPreviewDoc(submission)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Eye size={13} /> View File
            </button>

            {submission.status !== 'Graded' && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                Resubmit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload/Submission Area */}
      {(!submission || showUploadForm) && (
        <form onSubmit={handleSubmit} style={{
          padding: 16,
          background: 'var(--glass-surface-light)',
          border: '1px dashed rgba(31, 187, 210, 0.35)',
          borderRadius: 'var(--radius-md)',
          marginTop: 12
        }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.msword,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
            style={{ display: 'none' }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              background: selectedFile ? 'rgba(31, 187, 210, 0.08)' : 'transparent',
              transition: 'background 0.2s ease',
              marginBottom: 14
            }}
          >
            <Upload size={28} style={{ color: 'var(--cyan)', margin: '0 auto 8px' }} />
            {selectedFile ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  Selected: {selectedFile.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  Click to select file or drag & drop here
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Supported Formats: PDF, DOC, DOCX (MS Word), ZIP (Max 25 MB)
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Student Notes / Comments (Optional):
            </label>
            <textarea
              className="input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any comments or repo links for the instructor..."
              style={{ width: '100%', fontSize: 12 }}
            />
          </div>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 12, marginBottom: 12 }}>
              <AlertTriangle size={14} /> {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {showUploadForm && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowUploadForm(false); setSelectedFile(null); }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || (!selectedFile && !submission)}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? 'Uploading...' : (submission ? 'Submit Update' : 'Submit Assignment')}
            </button>
          </div>
        </form>
      )}

      {submitSuccess && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: 'rgba(16, 185, 129, 0.12)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--emerald)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <CheckCircle2 size={15} /> Your assignment was submitted successfully!
        </div>
      )}

      {/* Document Viewer Modal for inspecting submitted assignments & briefs */}
      <DocumentViewerModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        file={previewDoc}
      />
    </div>
  );
}
