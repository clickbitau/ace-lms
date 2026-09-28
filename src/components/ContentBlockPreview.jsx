import { useState } from 'react';
import VideoPlayer from './video-studio/VideoPlayer';
import { DEMO_PRESET_MANIFEST } from '../data/interactiveVideoPresets';
import {
  Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, Settings, Maximize,
  FileText, Download, Eye, Type, HelpCircle, CheckSquare,
  CheckCircle2, Sparkles, RefreshCw, Presentation, Headphones,
  ChevronLeft, ChevronRight, BookOpen, Layers, ExternalLink,
  Check, X, AlertCircle, XCircle
} from 'lucide-react';

export default function ContentBlockPreview({
  block,
  lessonTitle = '',
  onComplete = () => {},
  isCompact = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  const [interactiveCurrentTime, setInteractiveCurrentTime] = useState(0);
  const [interactiveDuration, setInteractiveDuration] = useState(33);
  const [interactiveIsPlaying, setInteractiveIsPlaying] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [checklistCompleted, setChecklistCompleted] = useState({});
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [audioProgress, setAudioProgress] = useState(25);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  if (!block) return null;

  const type = block.type || 'video';
  
  let rawPayload = block.payloadJson;
  if (typeof rawPayload === 'string') {
    try {
      rawPayload = JSON.parse(rawPayload);
    } catch {
      rawPayload = {};
    }
  }

  const pData = rawPayload || {
    title: block.title,
    desc: block.desc,
    mediaUrl: block.mediaUrl,
    duration: block.duration,
    content: block.content,
    questions: block.questions,
    checklistItems: block.checklistItems,
    fileName: block.fileName,
    fileSize: block.fileSize,
    fileUrl: block.fileUrl,
    passingScore: block.passingScore,
    slideCount: block.slideCount,
  };

  const blockTitle = pData.title || block.title || lessonTitle || 'Lesson Content';

  // 1. PDF Document
  if (type === 'pdf') {
    return (
      <div className="player-pdf-container" style={{ padding: isCompact ? '20px 16px' : '28px 24px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FileText size={28} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: isCompact ? 16 : 18, color: 'var(--text-primary)' }}>
            {pData.fileName || blockTitle}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Course Document & Reading Material • {pData.fileSize || '2.4 MB'} • PDF Format
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <a
            href={pData.fileUrl || '#'}
            download={pData.fileName || 'course_document.pdf'}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            onClick={(e) => {
              if (!pData.fileUrl) e.preventDefault();
              onComplete();
            }}
          >
            <Download size={14} /> Download Document
          </a>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              if (pData.fileUrl) window.open(pData.fileUrl, '_blank');
              onComplete();
            }}
          >
            <Eye size={14} /> View in Browser
          </button>
        </div>
      </div>
    );
  }

  // 1.5. Presentation Slides
  if (type === 'presentation' || type === 'slides') {
    const totalSlides = Math.max(1, Number(pData.slideCount) || 18);
    const hasEmbedUrl = pData.fileUrl && (pData.fileUrl.startsWith('http://') || pData.fileUrl.startsWith('https://'));

    const handleNextSlide = () => {
      if (currentSlide < totalSlides) {
        const next = currentSlide + 1;
        setCurrentSlide(next);
        if (next === totalSlides) {
          onComplete();
        }
      } else {
        onComplete();
      }
    };

    const handlePrevSlide = () => {
      if (currentSlide > 1) {
        setCurrentSlide(currentSlide - 1);
      }
    };

    return (
      <div className="player-slides-container" style={{ marginBottom: isCompact ? 12 : 20 }}>
        {/* Top Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', background: 'var(--topbar-bg)',
          borderBottom: 'var(--border-subtle)', flexWrap: 'wrap', gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Presentation size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {blockTitle}
              </h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Slide Deck Presentation • {totalSlides} Slides • {pData.duration || '15 mins'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pData.fileUrl && (
              <a
                href={pData.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px' }}
                title="Open in new window"
              >
                <ExternalLink size={13} />
                <span>Open Source</span>
              </a>
            )}
            <button
              type="button"
              className={`btn btn-sm ${showNotes ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowNotes(!showNotes)}
            >
              <BookOpen size={13} />
              <span>{showNotes ? 'Hide Notes' : 'Presenter Notes'}</span>
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="slides-viewport" style={{ minHeight: isCompact ? 220 : 360 }}>
          {hasEmbedUrl ? (
            <iframe
              src={pData.fileUrl}
              title={blockTitle}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', minHeight: isCompact ? 220 : 360,
              background: 'radial-gradient(circle at 50% 30%, #17283b, #0a131c)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: isCompact ? '20px 16px' : '36px 30px', textAlign: 'center', color: '#fff',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40, width: 180, height: 180,
                borderRadius: '50%', background: 'rgba(31, 187, 210, 0.08)', filter: 'blur(30px)'
              }} />
              <div style={{
                position: 'absolute', bottom: -40, left: -40, width: 180, height: 180,
                borderRadius: '50%', background: 'rgba(243, 156, 18, 0.08)', filter: 'blur(30px)'
              }} />

              {/* Slide Number Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(31, 187, 210, 0.2)', border: '1px solid rgba(31, 187, 210, 0.4)',
                color: 'var(--cyan)', fontSize: 12, fontWeight: 700, marginBottom: 16
              }}>
                <Layers size={13} />
                SLIDE {currentSlide} OF {totalSlides}
              </div>

              {/* Main Slide Title */}
              <h2 style={{
                fontSize: isCompact ? 18 : 26, fontWeight: 800, margin: '0 0 12px 0',
                color: '#ffffff', maxWidth: 640, lineHeight: 1.3
              }}>
                {currentSlide === 1 ? blockTitle : `Key Strategy Milestone #${currentSlide}`}
              </h2>

              {/* Slide Content Takeaway */}
              <p style={{
                fontSize: isCompact ? 13 : 15, color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: 580, lineHeight: 1.6, margin: '0 0 20px 0'
              }}>
                {currentSlide === 1
                  ? (pData.desc || 'Explore key architectural concepts, interactive frameworks, and strategic paradigms.')
                  : `Phase ${currentSlide} focus: Implement real-world actionable standards with measurable key indicators and continuous refinement.`}
              </p>

              {/* Progress bar along bottom of slide canvas */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
                background: 'rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(currentSlide / totalSlides) * 100}%`,
                  background: 'var(--cyan)',
                  transition: 'width 0.25s ease'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Toolbar / Controls */}
        <div className="slides-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentSlide <= 1}
              onClick={handlePrevSlide}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', padding: '0 6px' }}>
              Slide {currentSlide} / {totalSlides}
            </span>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleNextSlide}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {currentSlide === totalSlides && (
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={onComplete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <CheckCircle2 size={14} /> Completed Slide Review
              </button>
            )}
          </div>
        </div>

        {/* Presenter Notes Accordion */}
        {showNotes && (
          <div style={{
            padding: 16, background: 'var(--bg-card)',
            borderTop: 'var(--border-subtle)',
            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} style={{ color: 'var(--cyan)' }} /> Presenter Notes & Slide Summary:
            </div>
            {pData.content || (
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                No custom notes attached to this slide deck. Pay close attention to key takeaways and visual charts.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // 1.8. Audio Lecture / Podcast
  if (type === 'audio' || type === 'podcast') {
    const speeds = [1, 1.25, 1.5, 2];

    const togglePlay = () => {
      setIsPlaying(!isPlaying);
      const nextProgress = Math.min(100, audioProgress + 15);
      setAudioProgress(nextProgress);
      if (nextProgress >= 90) onComplete();
    };

    const handleSeek = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
      setAudioProgress(pct);
      if (pct >= 90) onComplete();
    };

    const cycleSpeed = () => {
      const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
      setAudioSpeed(speeds[nextIdx]);
    };

    return (
      <div className="audio-player-card" style={{ marginBottom: isCompact ? 12 : 20, padding: isCompact ? 16 : 24 }}>
        {/* Header / Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(31, 187, 210, 0.2), rgba(243, 156, 18, 0.2))',
              border: '1px solid rgba(31, 187, 210, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cyan)'
            }}>
              <Headphones size={26} />
            </div>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                <Sparkles size={12} /> Audio Lecture
              </div>
              <h3 style={{ margin: '2px 0 4px 0', fontSize: isCompact ? 16 : 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {blockTitle}
              </h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {pData.fileName || 'Studio Audio Recording'} • Duration: {pData.duration || '14:20'}
              </div>
            </div>
          </div>

          {/* Equalizer Waveform */}
          <div className="audio-equalizer" title={isPlaying ? 'Audio playing' : 'Audio paused'}>
            {[40, 70, 100, 55, 85, 45, 95, 60, 80, 50].map((h, idx) => (
              <div
                key={idx}
                className="audio-equalizer-bar"
                style={{
                  height: `${h}%`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                  animationDelay: `${idx * 0.1}s`,
                  opacity: isPlaying ? 1 : 0.4
                }}
              />
            ))}
          </div>
        </div>

        {/* Scrub Bar */}
        <div>
          <div
            className="audio-scrub-bar"
            onClick={handleSeek}
            style={{ height: 8, borderRadius: 999, cursor: 'pointer' }}
          >
            <div className="audio-scrub-fill" style={{ width: `${audioProgress}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>{Math.floor(audioProgress * 14.3 / 100)}:{String(Math.floor((audioProgress * 14.3 / 100 % 1) * 60)).padStart(2, '0')}</span>
            <span>{pData.duration || '14:20'}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Rewind 15s */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setAudioProgress(Math.max(0, audioProgress - 10))}
              title="Rewind 15 seconds"
              style={{ color: 'var(--text-secondary)' }}
            >
              <RotateCcw size={16} />
            </button>

            {/* Play / Pause Main Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={togglePlay}
              style={{
                width: 44, height: 44, borderRadius: '50%', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
            </button>

            {/* Fast forward 15s */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const next = Math.min(100, audioProgress + 10);
                setAudioProgress(next);
                if (next >= 90) onComplete();
              }}
              title="Forward 15 seconds"
              style={{ color: 'var(--text-secondary)' }}
            >
              <SkipForward size={16} />
            </button>

            {/* Speed Toggle */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={cycleSpeed}
              style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px' }}
              title="Change playback speed"
            >
              {audioSpeed}x
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mute button */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              title={isAudioMuted ? 'Unmute' : 'Mute'}
              style={{ color: isAudioMuted ? 'var(--red)' : 'var(--text-secondary)' }}
            >
              {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Transcript Toggle */}
            <button
              type="button"
              className={`btn btn-sm ${showTranscript ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <BookOpen size={14} />
              <span>{showTranscript ? 'Hide Transcript' : 'Transcript'}</span>
            </button>

            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={onComplete}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle2 size={14} /> Finish Listening
            </button>
          </div>
        </div>

        {/* Transcript Drawer */}
        {showTranscript && (
          <div style={{
            padding: 16, background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)',
            marginTop: 8
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} style={{ color: 'var(--cyan)' }} /> Audio Lecture Transcript:
            </div>
            <div style={{
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
              maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-line', paddingRight: 8
            }}>
              {pData.content || `[00:00] Welcome to this audio lecture session.\n[00:45] We will cover core operational principles and best practices.\n[03:20] Note the key performance indicators mentioned in the companion reading.\n[07:15] Practical advice on overcoming common roadblocks.\n[12:30] Summary and key action items before our next milestone.`}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Rich Text / Article
  if (type === 'text') {
    const textContent = pData.content || `## ${blockTitle}\n\nKey Concepts & Practical Guidance:\n- Understand core structural objectives before implementation.\n- Follow modular architecture and psychological safety protocols.\n- Review real-world case studies with your team.\n\nNext Action: Reflect on how this applies to your current project workflow.`;

    return (
      <div className="player-article-container" style={{ padding: isCompact ? 16 : 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: 'rgba(168, 85, 247, 0.1)', color: 'var(--emerald)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Type size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)', fontWeight: 700 }}>{blockTitle}</h3>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Structured reading and reference guide</span>
          </div>
        </div>
        <div style={{
          color: 'var(--text-primary)',
          fontSize: 14,
          lineHeight: 1.8,
          fontWeight: 450,
          whiteSpace: 'pre-line',
          background: 'var(--glass-surface-elevated, #ffffff)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          border: 'var(--border-default)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {textContent}
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={onComplete}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2 size={14} /> Finish Reading & Complete
          </button>
        </div>
      </div>
    );
  }

  // 3. Assessment Quiz
  if (type === 'quiz') {
    const questions = (pData.questions && pData.questions.length > 0) ? pData.questions : [
      {
        id: 'q1',
        prompt: 'What is the primary objective of this module?',
        options: ['Empower team ownership and psychological safety', 'Enforce strict top-down mandates', 'Eliminate all retro feedback sessions', 'Micromanage daily ticket updates'],
        correctIdx: 0,
      },
      {
        id: 'q2',
        prompt: 'How should milestone progress be evaluated?',
        options: ['Lines of code written', 'Outcome delivery and sprint retrospectives', 'Total desk hours logged', 'Quantity of email updates'],
        correctIdx: 1,
      }
    ];

    const passThreshold = pData.passingScore || 70;

    const handleSubmitQuiz = () => {
      let correctCount = 0;
      questions.forEach((q, idx) => {
        const answer = quizAnswers[q.id || idx];
        if (answer !== undefined && answer === q.correctIdx) {
          correctCount++;
        }
      });
      const percentage = Math.round((correctCount / questions.length) * 100);
      const passed = percentage >= passThreshold;
      setQuizScore({ percentage, passed, correctCount, total: questions.length });
      if (passed) {
        onComplete();
      }
    };

    return (
      <div className="player-quiz-container" style={{ padding: isCompact ? 16 : 24 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{blockTitle}</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {questions.length} questions • {passThreshold}% passing score
              </span>
            </div>
          </div>
          {quizScore && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setQuizScore(null); setQuizAnswers({}); }}
              style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} /> Reset Quiz
            </button>
          )}
        </div>

        {quizScore && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, marginBottom: 16,
            background: quizScore.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${quizScore.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: quizScore.passed ? 'var(--emerald)' : '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {quizScore.passed
                ? `🎉 Score: ${quizScore.percentage}% (${quizScore.correctCount}/${quizScore.total}) — Passed! You met the passing standard.`
                : `⚠️ Score: ${quizScore.percentage}% (${quizScore.correctCount}/${quizScore.total}) — Minimum ${passThreshold}% required. Please review and retry.`}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, qIdx) => {
            const isSubmitted = !!quizScore;
            const selectedOptIdx = quizAnswers[q.id || qIdx];
            const isQuestionCorrect = selectedOptIdx === q.correctIdx;

            return (
              <div
                key={q.id || qIdx}
                style={{
                  padding: 16,
                  background: isSubmitted
                    ? (isQuestionCorrect ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)')
                    : 'rgba(255,255,255,0.02)',
                  borderRadius: 10,
                  border: isSubmitted
                    ? (isQuestionCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)')
                    : 'var(--border-subtle)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Question Prompt & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {qIdx + 1}. {q.prompt}
                  </div>
                  {isSubmitted && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: isQuestionCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: isQuestionCorrect ? 'var(--emerald)' : '#ef4444',
                        border: `1px solid ${isQuestionCorrect ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0
                      }}
                    >
                      {isQuestionCorrect ? <><CheckCircle2 size={12} /> Correct (+1)</> : <><XCircle size={12} /> Incorrect (0)</>}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(q.options || []).map((opt, optIdx) => {
                    const isSelected = selectedOptIdx === optIdx;
                    const isCorrect = optIdx === q.correctIdx;

                    let bg = 'rgba(255,255,255,0.03)';
                    let border = '1px solid rgba(255,255,255,0.05)';
                    let textColor = 'var(--text-secondary)';
                    let cursor = 'pointer';

                    if (isSubmitted) {
                      cursor = 'default';
                      if (isCorrect) {
                        bg = 'rgba(16, 185, 129, 0.18)';
                        border = '1.5px solid var(--emerald)';
                        textColor = '#ecfdf5';
                      } else if (isSelected && !isCorrect) {
                        bg = 'rgba(239, 68, 68, 0.15)';
                        border = '1.5px solid #ef4444';
                        textColor = '#fca5a5';
                      } else {
                        bg = 'rgba(255,255,255,0.015)';
                        border = '1px solid rgba(255,255,255,0.03)';
                        textColor = 'var(--text-muted)';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(168, 85, 247, 0.2)';
                      border = '1px solid #c084fc';
                      textColor = '#fff';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={!isSubmitted ? () => setQuizAnswers(prev => ({ ...prev, [q.id || qIdx]: optIdx })) : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor,
                          background: bg,
                          border,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Radio Icon / Checkmark Indicator */}
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: isSubmitted
                              ? (isCorrect
                                  ? '2px solid var(--emerald)'
                                  : (isSelected ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.2)'))
                              : `2px solid ${isSelected ? '#c084fc' : 'var(--text-muted)'}`,
                            background: isSubmitted
                              ? (isCorrect
                                  ? 'var(--emerald)'
                                  : (isSelected ? '#ef4444' : 'transparent'))
                              : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {isSubmitted ? (
                            isCorrect ? (
                              <Check size={11} color="#ffffff" strokeWidth={3} />
                            ) : isSelected ? (
                              <X size={11} color="#ffffff" strokeWidth={3} />
                            ) : null
                          ) : (
                            isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c084fc' }} />
                          )}
                        </div>

                        {/* Option Text */}
                        <span style={{ fontSize: 13, color: textColor, fontWeight: isSubmitted && isCorrect ? 600 : 400 }}>
                          {opt}
                        </span>

                        {/* Badges when submitted */}
                        {isSubmitted && (
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {isCorrect && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: isSelected ? 'var(--emerald)' : 'rgba(16, 185, 129, 0.25)',
                                  color: isSelected ? '#ffffff' : 'var(--emerald)',
                                  border: isSelected ? 'none' : '1px solid var(--emerald)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Check size={11} /> {isSelected ? 'Correct (Your Choice)' : 'Correct Answer'}
                              </span>
                            )}
                            {isSelected && !isCorrect && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: '#ef4444',
                                  color: '#ffffff',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <X size={11} /> Incorrect (Your Choice)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quiz Actions Footer */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          {quizScore ? (
            <>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {quizScore.passed
                  ? '✨ Lesson mastery achieved! Correct answers highlighted above.'
                  : '💡 Review the highlighted correct answers above to learn the concepts, then retake the quiz.'}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setQuizScore(null); setQuizAnswers({}); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} /> Retake Quiz
                </button>
                {quizScore.passed && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={onComplete}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <CheckCircle2 size={14} /> Finish Lesson
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ marginLeft: 'auto' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length === 0}
              >
                Submit Answers & Grade
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Action Checklist
  if (type === 'checklist') {
    const items = (pData.checklistItems && pData.checklistItems.length > 0)
      ? pData.checklistItems
      : ['Review module reference guides', 'Complete hands-on implementation tasks', 'Submit verification results to team lead'];

    const checkedCount = Object.values(checklistCompleted).filter(Boolean).length;
    const progressPct = Math.round((checkedCount / items.length) * 100);

    const toggleTask = (idx) => {
      const next = { ...checklistCompleted, [idx]: !checklistCompleted[idx] };
      setChecklistCompleted(next);
      if (Object.values(next).filter(Boolean).length === items.length) {
        onComplete();
      }
    };

    return (
      <div className="player-checklist-container" style={{ padding: isCompact ? 16 : 24 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'rgba(20, 184, 166, 0.2)', color: 'var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{blockTitle}</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {checkedCount} of {items.length} tasks completed ({progressPct}%)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((task, idx) => {
            const isDone = !!checklistCompleted[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleTask(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 8, cursor: 'pointer',
                  background: isDone ? 'rgba(20, 184, 166, 0.12)' : 'rgba(255,255,255,0.03)',
                  border: isDone ? '1px solid rgba(20, 184, 166, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: isDone ? 'var(--cyan)' : 'transparent',
                  border: `2px solid ${isDone ? 'var(--cyan)' : 'var(--text-muted)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', flexShrink: 0
                }}>
                  {isDone && <CheckCircle2 size={14} style={{ color: '#000' }} />}
                </div>
                <span style={{
                  fontSize: 13,
                  color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isDone ? 'line-through' : 'none'
                }}>
                  {task}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 5. Video or Interactive Video (Default)
  const isInteractive = type === 'interactive' || type === 'interactive_video';

  if (isInteractive) {
    const activeInteractions = (pData.interactions && pData.interactions.length > 0)
      ? pData.interactions
      : DEMO_PRESET_MANIFEST.interactions;
    const videoSource = pData.mediaUrl || pData.videoSrc || DEMO_PRESET_MANIFEST.videoSrc;

    const handleInteractiveTimeUpdate = (time) => {
      setInteractiveCurrentTime(time);
      if (interactiveDuration > 0) {
        const pct = (time / interactiveDuration) * 100;
        if (pct >= 85) {
          onComplete();
        }
      }
    };

    return (
      <div className="ivs-viewer-player-card" style={{ marginBottom: isCompact ? 12 : 20, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
        <VideoPlayer
          videoSrc={videoSource}
          interactions={activeInteractions}
          currentTime={interactiveCurrentTime}
          duration={interactiveDuration}
          isPlaying={interactiveIsPlaying}
          isEditor={false}
          onTimeUpdate={handleInteractiveTimeUpdate}
          onDurationChange={setInteractiveDuration}
          onPlayStateChange={setInteractiveIsPlaying}
          onSeek={setInteractiveCurrentTime}
          onSwitchToLocalDemo={() => {}}
        />

        {/* Interactive Stats Footer */}
        <div style={{
          padding: '12px 16px', background: 'rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={14} /> Interactive Checkpoint Lesson
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {activeInteractions.filter(i => i.type === 'hotspot').length} Hotspots &bull; {activeInteractions.filter(i => i.type === 'branching').length} Decisions &bull; {activeInteractions.filter(i => i.type === 'quiz').length} Quizzes
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => onComplete()}
            title="Mark this interactive block complete"
          >
            <CheckCircle2 size={13} style={{ color: 'var(--emerald)' }} />
            <span>Mark Complete</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-mock" style={{ marginBottom: isCompact ? 12 : 20, minHeight: isCompact ? 240 : 360 }}>
      <div style={{
        width: '100%', height: '100%', minHeight: isCompact ? 240 : 360,
        background: 'linear-gradient(135deg, #091724, #0d2235)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Title Bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Play size={14} />
            {blockTitle}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {pData.duration || '12:00'}
          </span>
        </div>

        {/* Center Play Button */}
        <button
          type="button"
          onClick={() => {
            setIsPlaying(!isPlaying);
            const nextProgress = Math.min(100, videoProgress + 25);
            setVideoProgress(nextProgress);
            if (nextProgress >= 90) onComplete();
          }}
          style={{
            width: isCompact ? 52 : 64, height: isCompact ? 52 : 64, borderRadius: '50%',
            background: isPlaying ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.35)',
            border: `2px solid ${isPlaying ? 'var(--emerald)' : 'var(--cyan)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', zIndex: 2,
            transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
          title="Click to simulate playback"
        >
          {isPlaying ? <Pause size={isCompact ? 22 : 28} /> : <Play size={isCompact ? 22 : 28} style={{ marginLeft: 3 }} />}
        </button>

        {/* Video Overlay Controls */}
        <div className="video-player-overlay">
          <div className="video-player-controls">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextProgress = Math.min(100, videoProgress + 20);
                setVideoProgress(nextProgress);
                if (nextProgress >= 90) onComplete();
              }}
              style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Skip +20%"
            >
              <SkipForward size={16} />
            </button>
            <div
              className="video-player-seekbar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.round((clickX / rect.width) * 100);
                setVideoProgress(pct);
                if (pct >= 90) onComplete();
              }}
            >
              <div className="video-player-seekbar-fill" style={{ width: `${videoProgress}%` }} />
            </div>
            <span className="video-player-time" style={{ fontSize: 11 }}>
              {Math.floor(videoProgress * 12 / 100)}:{String(Math.floor((videoProgress * 12 / 100 % 1) * 60)).padStart(2, '0')} / {pData.duration || '12:00'}
            </span>
            <button type="button" style={{ color: 'white', background: 'none', border: 'none' }}><Volume2 size={16} /></button>
            <button type="button" style={{ color: 'white', background: 'none', border: 'none' }}><Settings size={16} /></button>
            <button type="button" style={{ color: 'white', background: 'none', border: 'none' }}><Maximize size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
