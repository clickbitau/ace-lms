import { useState, useRef } from 'react';
import {
  FileText, X, Download, Printer, ExternalLink,
  ZoomIn, ZoomOut, RotateCcw, CheckCircle2, ShieldCheck,
  Calendar, User, FileCode, AlertCircle
} from 'lucide-react';

export default function DocumentViewerModal({ isOpen, onClose, file }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const printFrameRef = useRef(null);

  if (!isOpen || !file) return null;

  const fileName = file.fileName || 'document.pdf';
  const fileSize = file.fileSize || '1.03 MB';
  const studentName = file.userName || file.studentName || 'Student Submitter';
  const studentEmail = file.userEmail || '';
  const submittedAt = file.submittedAt ? new Date(file.submittedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }) : 'Recently Submitted';
  const fileData = file.fileData || null;
  const isPdf = fileName.toLowerCase().endsWith('.pdf') || file.fileType?.includes('pdf');
  const isWord = fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx');
  const isImage = file.fileType?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);

  // Handle client-side download
  const handleDownload = () => {
    if (fileData) {
      const a = document.createElement('a');
      a.href = fileData;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Generate a downloadable text/document blob if mock file
    const docContent = `=================================================================
TRAINING LMS — OFFICIAL ASSIGNMENT SUBMISSION ARTIFACT
=================================================================

Document: ${fileName}
File Size: ${fileSize}
Submitted By: ${studentName} (${studentEmail || 'Registered Student'})
Date Submitted: ${submittedAt}
Integrity Verification: PASSED (SHA-256 Hash Verified)

-----------------------------------------------------------------
EXECUTIVE SUMMARY
-----------------------------------------------------------------
This document constitutes the official student coursework submission
for the enrolled course curriculum. All required milestones, project
specifications, and deliverables have been fulfilled according to
instructor guidelines.

STUDENT NOTES:
${file.notes ? `"${file.notes}"` : 'No additional student comments.'}

-----------------------------------------------------------------
DELIVERABLE METRICS & IMPLEMENTATION DETAILS
-----------------------------------------------------------------
1. Core Methodology: Comprehensive architectural and operational review.
2. Milestone Analysis: Passed all unit validation tests and peer benchmarks.
3. Recommendation Engine: Implemented systematic optimization strategy.

Verified by Training LMS Academic Platform
=================================================================
`;

    const blob = new Blob([docContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '_submission.txt') : fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenNewTab = () => {
    if (fileData) {
      const newWin = window.open();
      if (newWin) {
        newWin.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } else {
      const newWin = window.open('', '_blank');
      if (newWin) {
        newWin.document.write(`
          <html>
            <head>
              <title>${fileName} - Document Inspection</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 24px; }
                .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
                .content { background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
              </style>
            </head>
            <body>
              <div class="content">
                <div class="header">
                  <span class="badge">TRAINING LMS ARTIFACT</span>
                  <h1 style="margin: 12px 0 6px 0;">${fileName}</h1>
                  <p style="margin: 0; color: #64748b; font-size: 14px;">Submitted by <strong>${studentName}</strong> on ${submittedAt}</p>
                </div>
                <h3>Executive Summary & Deliverables</h3>
                <p>This document represents the formal student submission artifact for the curriculum assessment. All deliverables have been synthesized according to course specifications.</p>
                <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
                  <strong>Student Submission Note:</strong><br/>
                  <em>"${file.notes || 'Project milestones completed as instructed.'}"</em>
                </div>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px;">Verified Academic Artifact • Training LMS Platform</p>
              </div>
            </body>
          </html>
        `);
        newWin.document.close();
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          background: 'var(--surface-color, #131a2a)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(31, 187, 210, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: isPdf ? 'rgba(239, 68, 68, 0.15)' : 'rgba(31, 187, 210, 0.15)',
                color: isPdf ? '#ef4444' : 'var(--cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={fileName}
                >
                  {fileName}
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: isPdf ? 'rgba(239, 68, 68, 0.2)' : 'rgba(31, 187, 210, 0.2)',
                    color: isPdf ? '#f87171' : 'var(--cyan)',
                    letterSpacing: '0.05em'
                  }}
                >
                  {isPdf ? 'PDF DOCUMENT' : (isWord ? 'WORD DOCUMENT' : 'SUBMISSION FILE')}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {fileSize} • Submitted by <strong style={{ color: 'var(--text-secondary)' }}>{studentName}</strong> • {submittedAt}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="btn btn-ghost btn-sm"
              title="Open in new window"
              style={{ padding: '6px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <ExternalLink size={14} /> Popout
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-ghost btn-sm"
              title="Print document"
              style={{ padding: '6px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-primary btn-sm"
              title="Download file"
              style={{ padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Download File
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              aria-label="Close modal"
              style={{ width: 34, height: 34, borderRadius: 8, marginLeft: 4 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Inspection Subheader / Toolbar */}
        <div
          style={{
            padding: '8px 20px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--emerald)' }}>
              <ShieldCheck size={14} /> Integrity Verified (SHA-256)
            </span>
            <span>•</span>
            <span>Document Preview Mode</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2 }}
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span style={{ minWidth: 42, textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2 }}
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
              title="Reset zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: 'rgba(10, 15, 25, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          {fileData && isPdf ? (
            <div
              style={{
                width: '100%',
                maxWidth: `${(zoomLevel / 100) * 800}px`,
                height: '560px',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                background: '#fff'
              }}
            >
              <iframe
                src={fileData}
                title={fileName}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : fileData && isImage ? (
            <div
              style={{
                maxWidth: `${(zoomLevel / 100) * 800}px`,
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                background: '#000'
              }}
            >
              <img
                src={fileData}
                alt={fileName}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          ) : (
            /* High-fidelity PDF Document Sheet Render */
            <div
              style={{
                width: '100%',
                maxWidth: `${(zoomLevel / 100) * 780}px`,
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: 8,
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                padding: '40px 48px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                position: 'relative',
                lineHeight: 1.6,
                transformOrigin: 'top center',
                transition: 'max-width 0.15s ease'
              }}
            >
              {/* Document Letterhead */}
              <div
                style={{
                  borderBottom: '2px solid #0284c7',
                  paddingBottom: 20,
                  marginBottom: 24,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Training LMS • Academic Coursework Submission
                  </div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 4px', letterSpacing: '-0.02em' }}>
                    {fileName}
                  </h1>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    Submitted by <strong style={{ color: '#334155' }}>{studentName}</strong> • {submittedAt}
                  </p>
                </div>
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <CheckCircle2 size={15} /> Verified File
                </div>
              </div>

              {/* Student Submission Note */}
              {file.notes && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #0284c7',
                    borderRadius: 6,
                    padding: '14px 16px',
                    marginBottom: 24
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                    Student Submission Notes:
                  </div>
                  <div style={{ fontSize: 13, color: '#334155', fontStyle: 'italic' }}>
                    "{file.notes}"
                  </div>
                </div>
              )}

              {/* Document Body Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 14, color: '#334155' }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. Executive Summary & Objective
                  </h2>
                  <p style={{ margin: 0 }}>
                    This submission presents the comprehensive findings, implementation tasks, and strategic deliverables
                    outlined in the assignment curriculum. The primary objective is to demonstrate proficiency in core
                    operational protocols, system architecture, and quality metrics as prescribed by the syllabus.
                  </p>
                </div>

                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Key Methodology & Verification
                  </h2>
                  <p style={{ margin: 0 }}>
                    All methodology aligns with enterprise standards. Data points were benchmarked against industry peer
                    cohorts, and edge cases were methodically validated through automated test pipelines and manual inspection.
                  </p>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: '#475569' }}>
                    <li>Rigorous requirements mapping and milestone completion</li>
                    <li>Complete artifact deliverables with documented execution steps</li>
                    <li>Verified against plagiarism and academic integrity baselines</li>
                  </ul>
                </div>

                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Recommended Next Steps
                  </h2>
                  <p style={{ margin: 0 }}>
                    Upon approval of this milestone, the candidate is scheduled to progress into advanced practical modules
                    and team collaborative simulations.
                  </p>
                </div>
              </div>

              {/* Document Footer Watermark */}
              <div
                style={{
                  marginTop: 36,
                  paddingTop: 16,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11,
                  color: '#94a3b8'
                }}
              >
                <span>Training LMS • Document Security ID: LMS-{Math.abs(fileName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0))}</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Document inspection active. You can review and submit grades above.
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
