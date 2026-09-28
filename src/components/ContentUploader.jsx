import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import { DEMO_PRESET_MANIFEST } from '../data/interactiveVideoPresets';
import {
  Upload, FileText, Video, Link, Trash2, CheckCircle2,
  HelpCircle, Plus, CheckSquare, Sparkles, AlertCircle,
  Code, Bold, Italic, List, Heading1, Heading2, Quote, Clock,
  Presentation, Headphones, Volume2, Layers, HardDrive, Search, X, Check,
  GitFork, MapPin, ExternalLink, Edit3
} from 'lucide-react';

export default function ContentUploader({ type, value = {}, onChange, courseId, lessonId, blockId }) {
  const navigate = useNavigate();
  const { mediaAssets } = useLms();
  const fileInputRef = useRef(null);
  const [videoMode, setVideoMode] = useState(value?.mediaUrl?.startsWith('data:') ? 'upload' : 'url');
  const [presentationMode, setPresentationMode] = useState(value?.fileUrl?.startsWith('blob:') ? 'upload' : 'url');
  const [audioMode, setAudioMode] = useState(value?.mediaUrl?.startsWith('blob:') || value?.mediaUrl?.startsWith('data:') ? 'upload' : 'url');

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickerFilter, setPickerFilter] = useState('all');
  const [pickerSearch, setPickerSearch] = useState('');

  const handleSelectMediaAsset = (asset) => {
    if (type === 'pdf') {
      onChange({
        ...value,
        fileName: asset.name,
        fileSize: asset.fileSize,
        fileUrl: asset.url,
      });
    } else if (type === 'presentation' || type === 'slides') {
      onChange({
        ...value,
        fileName: asset.name,
        fileSize: asset.fileSize,
        fileUrl: asset.url,
        duration: asset.duration || value.duration || '20 Slides',
      });
    } else if (type === 'audio' || type === 'podcast') {
      onChange({
        ...value,
        fileName: asset.name,
        fileSize: asset.fileSize,
        mediaUrl: asset.url,
        duration: asset.duration || value.duration || '15:00',
      });
    } else if (type === 'video' || type === 'interactive') {
      onChange({
        ...value,
        fileName: asset.name,
        fileSize: asset.fileSize,
        mediaUrl: asset.url,
        duration: asset.duration || value.duration || '12:00',
      });
    } else {
      onChange({
        ...value,
        fileName: asset.name,
        fileSize: asset.fileSize,
        mediaUrl: asset.url,
        fileUrl: asset.url,
      });
    }
    setShowMediaPicker(false);
  };

  // Handle local file selection (PDF, Document, Video, etc.)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    // Simulated local URL or Object URL
    const fileUrl = URL.createObjectURL(file);

    if (type === 'pdf' || type === 'presentation' || type === 'slides') {
      onChange({
        ...value,
        fileName: file.name,
        fileSize: sizeFormatted,
        fileUrl: fileUrl,
      });
    } else if (type === 'audio' || type === 'podcast') {
      onChange({
        ...value,
        fileName: file.name,
        fileSize: sizeFormatted,
        mediaUrl: fileUrl,
        duration: value.duration || '14:20',
      });
    } else if (type === 'video' || type === 'interactive') {
      onChange({
        ...value,
        fileName: file.name,
        fileSize: sizeFormatted,
        mediaUrl: fileUrl,
        duration: value.duration || '12:00',
      });
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange({
      ...value,
      fileName: '',
      fileSize: '',
      fileUrl: '',
      mediaUrl: '',
    });
  };

  // Text formatting helpers
  const handleInsertMarkup = (prefix, suffix = '') => {
    const textarea = document.getElementById('rich-text-content-area');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = value.content || '';
    const selected = current.substring(start, end) || 'text';
    const nextContent = current.substring(0, start) + prefix + selected + suffix + current.substring(end);
    onChange({ ...value, content: nextContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const renderContent = () => {
    // ─────────────────────────────────────────────────────────────
    // 1. PDF DOCUMENT UPLOADER
    // ─────────────────────────────────────────────────────────────
    if (type === 'pdf') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
              PDF / Document File Upload
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setPickerFilter('pdf'); setShowMediaPicker(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--cyan)',
                borderColor: 'rgba(31, 187, 210, 0.35)',
                background: 'rgba(31, 187, 210, 0.08)'
              }}
            >
              <HardDrive size={13} /> Choose from Media Library
            </button>
          </div>

        {value.fileName ? (
          <div className="file-upload-preview">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {value.fileName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{value.fileSize}</span>
                  <span style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> Ready
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '6px', color: '#ef4444' }}
              onClick={handleRemoveFile}
              title="Remove file"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div
            className="file-upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.epub"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Upload size={22} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Click to browse or drag & drop PDF
              </span>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                Supports PDF, DOC, DOCX up to 100MB
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Or External Document URL (S3, Google Drive, Direct Link)
          </label>
          <div className="input-with-icon">
            <Link size={14} className="input-icon" style={{ opacity: 0.6 }} />
            <input
              type="url"
              className="input"
              style={{ fontSize: 12, paddingLeft: 34 }}
              placeholder="https://example.com/handbook.pdf"
              value={value.fileUrl || ''}
              onChange={e => onChange({ ...value, fileUrl: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. VIDEO / INTERACTIVE VIDEO UPLOADER
  // ─────────────────────────────────────────────────────────────
  if (type === 'video' || type === 'interactive') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
            Video Source & Duration
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setPickerFilter('video'); setShowMediaPicker(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--cyan)',
                borderColor: 'rgba(31, 187, 210, 0.35)',
                background: 'rgba(31, 187, 210, 0.08)'
              }}
            >
              <HardDrive size={13} /> Media Library
            </button>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-control-btn ${videoMode === 'url' ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setVideoMode('url')}
              >
                Stream / Embed URL
              </button>
              <button
                type="button"
                className={`segmented-control-btn ${videoMode === 'upload' ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setVideoMode('upload')}
              >
                Upload Video File
              </button>
            </div>
          </div>
        </div>

        {videoMode === 'upload' ? (
          value.fileName ? (
            <div className="file-upload-preview">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Video size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {value.fileName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{value.fileSize} • Video ready</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '6px', color: '#ef4444' }}
                onClick={handleRemoveFile}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              className="file-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Video size={22} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Click to select or drag video file
                </span>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  MP4, WebM, MOV high-definition video
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="input-with-icon">
            <Link size={14} className="input-icon" style={{ opacity: 0.6 }} />
            <input
              type="url"
              className="input"
              style={{ fontSize: 12, paddingLeft: 34 }}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://cdn.example.com/lecture.mp4"
              value={value.mediaUrl || ''}
              onChange={e => onChange({ ...value, mediaUrl: e.target.value })}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Estimated Duration (MM:SS)
            </label>
            <div className="input-with-icon">
              <Clock size={14} className="input-icon" style={{ opacity: 0.6 }} />
              <input
                type="text"
                className="input"
                style={{ fontSize: 12, paddingLeft: 34 }}
                placeholder="15:30"
                value={value.duration || ''}
                onChange={e => onChange({ ...value, duration: e.target.value })}
              />
            </div>
          </div>
        </div>

        {(type === 'interactive' || type === 'interactive_video') && (
          <div style={{
            padding: 16, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(168, 85, 247, 0.06))',
            border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--cyan)', fontWeight: 700 }}>
                <Sparkles size={16} />
                <span>Interactive Video Milestones & Checkpoints</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => {
                    onChange({
                      ...value,
                      mediaUrl: value.mediaUrl || DEMO_PRESET_MANIFEST.videoSrc,
                      fileName: value.fileName || DEMO_PRESET_MANIFEST.videoName,
                      duration: value.duration || DEMO_PRESET_MANIFEST.duration,
                      interactions: DEMO_PRESET_MANIFEST.interactions
                    });
                  }}
                  title="Load pre-calibrated sample educational lecture and interactions"
                >
                  <Sparkles size={12} className="text-cyan" /> Load Preset
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    try {
                      localStorage.setItem('evergreen_interactive_video_manifest_v2', JSON.stringify({
                        videoTitle: value.title || 'Lesson Video',
                        videoName: value.fileName || 'Uploaded Video',
                        videoSrc: value.mediaUrl || '/demo-video.mp4',
                        interactions: value.interactions || [],
                        courseId,
                        lessonId,
                        blockId,
                        savedAt: new Date().toISOString()
                      }));
                    } catch (e) { /* ignore */ }
                    
                    const query = new URLSearchParams();
                    if (courseId) query.set('courseId', courseId);
                    if (lessonId) query.set('lessonId', lessonId);
                    if (blockId) query.set('blockId', blockId);
                    navigate(`/admin/video-studio?${query.toString()}`);
                  }}
                >
                  <Edit3 size={12} /> Author in Video Studio
                </button>
              </div>
            </div>

            {/* Interaction Summary Counts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', fontSize: 11 }}>
                <MapPin size={11} style={{ marginRight: 4 }} />
                {(value.interactions || []).filter(i => i.type === 'hotspot').length} Hotspots
              </span>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: 11 }}>
                <GitFork size={11} style={{ marginRight: 4 }} />
                {(value.interactions || []).filter(i => i.type === 'branching').length} Decisions
              </span>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: 11 }}>
                <HelpCircle size={11} style={{ marginRight: 4 }} />
                {(value.interactions || []).filter(i => i.type === 'quiz').length} Quizzes
              </span>
              {(value.interactions || []).length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, color: 'var(--red)', padding: '2px 6px', marginLeft: 'auto' }}
                  onClick={() => onChange({ ...value, interactions: [] })}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Checkpoint Timeline List */}
            {(value.interactions || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                {(value.interactions || []).map((node, idx) => {
                  const timeLabel = node.type === 'hotspot'
                    ? `${String(Math.floor(node.startTime / 60)).padStart(2, '0')}:${String(Math.floor(node.startTime % 60)).padStart(2, '0')} - ${String(Math.floor(node.endTime / 60)).padStart(2, '0')}:${String(Math.floor(node.endTime % 60)).padStart(2, '0')}`
                    : `${String(Math.floor(node.triggerTime / 60)).padStart(2, '0')}:${String(Math.floor(node.triggerTime % 60)).padStart(2, '0')}`;
                  return (
                    <div
                      key={node.id || idx}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 10px', borderRadius: 6,
                        background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--cyan)', fontWeight: 600, fontSize: 11 }}>
                          {timeLabel}
                        </span>
                        <span className="badge" style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          background: node.type === 'hotspot' ? 'rgba(6, 182, 212, 0.2)' : node.type === 'branching' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: node.type === 'hotspot' ? 'var(--cyan)' : node.type === 'branching' ? 'var(--amber)' : 'var(--emerald)'
                        }}>
                          {node.type.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {node.title || node.question || 'Untitled Node'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '2px 4px', color: 'var(--text-muted)' }}
                        onClick={() => {
                          const updated = (value.interactions || []).filter(i => (i.id || i) !== (node.id || node));
                          onChange({ ...value, interactions: updated });
                        }}
                        title="Remove checkpoint"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                No interactive nodes added yet. Click <strong>Author in Video Studio</strong> to visually position hotspots and checkpoint questions, or <strong>Load Preset</strong> to test with educational samples.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. RICH TEXT / ARTICLE CONTENT EDITOR
  // ─────────────────────────────────────────────────────────────
  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Article & Guide Text Content
          </label>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {(value.content || '').length} characters • {((value.content || '').trim().split(/\s+/).filter(Boolean).length)} words
          </span>
        </div>

        {/* Toolbar */}
        <div className="editor-toolbar">
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('# ')} title="Heading 1">
            <Heading1 size={13} />
          </button>
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('## ')} title="Heading 2">
            <Heading2 size={13} />
          </button>
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('**', '**')} title="Bold">
            <Bold size={13} />
          </button>
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('*', '*')} title="Italic">
            <Italic size={13} />
          </button>
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('- ')} title="Bullet List">
            <List size={13} />
          </button>
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('```\n', '\n```')} title="Code Block">
            <Code size={13} />
          </button>
          <button type="button" className="editor-toolbar-btn" onClick={() => handleInsertMarkup('> ')} title="Quote">
            <Quote size={13} />
          </button>
        </div>

        <textarea
          id="rich-text-content-area"
          className="input"
          style={{
            minHeight: 140,
            lineHeight: 1.6,
            fontFamily: 'inherit',
            fontSize: 13,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            resize: 'vertical'
          }}
          placeholder="Write your article, instructions, or guide content here... Use markdown or quick toolbar buttons above."
          value={value.content || ''}
          onChange={e => onChange({ ...value, content: e.target.value })}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ASSESSMENT QUIZ BUILDER
  // ─────────────────────────────────────────────────────────────
  if (type === 'quiz') {
    const questions = value.questions && value.questions.length > 0 ? value.questions : [
      {
        id: 'q1',
        prompt: 'What is the key takeaway of this lesson?',
        options: ['Core Principle A', 'Alternative B', 'Practice C', 'Evaluation D'],
        correctIdx: 0,
      }
    ];

    const updateQuestion = (qIdx, field, val) => {
      const nextQ = [...questions];
      nextQ[qIdx] = { ...nextQ[qIdx], [field]: val };
      onChange({ ...value, questions: nextQ });
    };

    const updateOption = (qIdx, optIdx, text) => {
      const nextQ = [...questions];
      const opts = [...nextQ[qIdx].options];
      opts[optIdx] = text;
      nextQ[qIdx].options = opts;
      onChange({ ...value, questions: nextQ });
    };

    const addQuestion = () => {
      const nextQ = [
        ...questions,
        {
          id: `q-${Date.now()}`,
          prompt: `Question ${questions.length + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIdx: 0,
        }
      ];
      onChange({ ...value, questions: nextQ });
    };

    const removeQuestion = (qIdx) => {
      if (questions.length <= 1) return;
      const nextQ = questions.filter((_, idx) => idx !== qIdx);
      onChange({ ...value, questions: nextQ });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Quiz Questions & Correct Answers
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Pass Score:</span>
            <input
              type="number"
              min="50"
              max="100"
              className="input"
              style={{ width: 60, padding: '3px 6px', fontSize: 12, textAlign: 'center' }}
              value={value.passingScore || 75}
              onChange={e => onChange({ ...value, passingScore: parseInt(e.target.value) || 75 })}
            />
            <span style={{ color: 'var(--text-muted)' }}>%</span>
          </div>
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={q.id || qIdx}
            style={{
              padding: 12, background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>
                Question {qIdx + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '2px 6px', color: '#ef4444' }}
                  onClick={() => removeQuestion(qIdx)}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <input
              type="text"
              className="input"
              style={{ marginBottom: 10, fontSize: 13 }}
              placeholder="Enter question text..."
              value={q.prompt}
              onChange={e => updateQuestion(qIdx, 'prompt', e.target.value)}
            />

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
              Select radio button for the correct answer:
            </div>

            {q.options.map((opt, optIdx) => (
              <div key={optIdx} className="quiz-option-row">
                <div
                  className={`quiz-radio-custom ${q.correctIdx === optIdx ? 'selected' : ''}`}
                  onClick={() => updateQuestion(qIdx, 'correctIdx', optIdx)}
                  title="Click to mark as correct answer"
                >
                  {q.correctIdx === optIdx && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                  )}
                </div>
                <input
                  type="text"
                  className="input"
                  style={{ fontSize: 12, padding: '6px 10px' }}
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                  value={opt}
                  onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={addQuestion}
        >
          <Plus size={14} /> Add Another Question
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ACTION CHECKLIST BUILDER
  // ─────────────────────────────────────────────────────────────
  if (type === 'checklist') {
    const items = value.checklistItems && value.checklistItems.length > 0
      ? value.checklistItems
      : ['Review guidelines and starter code', 'Complete environment configuration', 'Verify integration test passes'];

    const handleUpdateItem = (idx, text) => {
      const nextItems = [...items];
      nextItems[idx] = text;
      onChange({ ...value, checklistItems: nextItems });
    };

    const handleAddItem = () => {
      onChange({ ...value, checklistItems: [...items, `Task item ${items.length + 1}`] });
    };

    const handleRemoveItem = (idx) => {
      if (items.length <= 1) return;
      onChange({ ...value, checklistItems: items.filter((_, i) => i !== idx) });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Checklist Tasks
          </label>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{items.length} tasks</span>
        </div>

        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
            <input
              type="text"
              className="input"
              style={{ fontSize: 12, padding: '7px 10px' }}
              value={item}
              onChange={e => handleUpdateItem(idx, e.target.value)}
            />
            {items.length > 1 && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '4px', color: '#ef4444' }}
                onClick={() => handleRemoveItem(idx)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={handleAddItem}
        >
          <Plus size={14} /> Add Checklist Step
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 6. PRESENTATION SLIDES UPLOADER
  // ─────────────────────────────────────────────────────────────
  if (type === 'presentation' || type === 'slides') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
            Presentation Slides Source
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setPickerFilter('slides'); setShowMediaPicker(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--cyan)',
                borderColor: 'rgba(31, 187, 210, 0.35)',
                background: 'rgba(31, 187, 210, 0.08)'
              }}
            >
              <HardDrive size={13} /> Media Library
            </button>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-control-btn ${presentationMode === 'url' ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setPresentationMode('url')}
              >
                Embed / Web Link
              </button>
              <button
                type="button"
                className={`segmented-control-btn ${presentationMode === 'upload' ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setPresentationMode('upload')}
              >
                Upload Slide Deck
              </button>
            </div>
          </div>
        </div>

        {presentationMode === 'upload' ? (
          value.fileName ? (
            <div className="file-upload-preview">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Presentation size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {value.fileName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{value.fileSize} • Slide deck ready</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: 4, color: 'var(--text-muted)' }}
                onClick={handleRemoveFile}
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              className="file-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.key"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(31, 187, 210, 0.12)', color: 'var(--cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px'
              }}>
                <Upload size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                Upload Slide Deck (PDF, PPT, Keynote)
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Drag & drop or click to browse files
              </div>
            </div>
          )
        ) : (
          <div>
            <div style={{ position: 'relative' }}>
              <Link size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input"
                style={{ fontSize: 12, paddingLeft: 34 }}
                placeholder="Google Slides, Canva, or SlideShare embed URL (https://...)"
                value={value.fileUrl || ''}
                onChange={e => onChange({ ...value, fileUrl: e.target.value })}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              💡 Paste any public Google Slides embed link, Canva deck, or SlideShare presentation URL.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Slide Count
            </label>
            <input
              type="number"
              className="input"
              style={{ fontSize: 12 }}
              placeholder="e.g. 24"
              value={value.slideCount || 18}
              onChange={e => onChange({ ...value, slideCount: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Estimated Review Time
            </label>
            <input
              type="text"
              className="input"
              style={{ fontSize: 12 }}
              placeholder="e.g. 15 minutes"
              value={value.duration || '15 mins'}
              onChange={e => onChange({ ...value, duration: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Presenter Notes & Key Takeaways
          </label>
          <textarea
            className="textarea"
            rows={3}
            style={{ fontSize: 12 }}
            placeholder="Important talking points and slide reference summary..."
            value={value.content || ''}
            onChange={e => onChange({ ...value, content: e.target.value })}
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7. AUDIO LECTURE / PODCAST UPLOADER
  // ─────────────────────────────────────────────────────────────
  if (type === 'audio' || type === 'podcast') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
            Audio Source & Duration
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setPickerFilter('audio'); setShowMediaPicker(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--cyan)',
                borderColor: 'rgba(31, 187, 210, 0.35)',
                background: 'rgba(31, 187, 210, 0.08)'
              }}
            >
              <HardDrive size={13} /> Media Library
            </button>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-control-btn ${audioMode === 'url' ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setAudioMode('url')}
              >
                Stream / Podcast URL
              </button>
              <button
                type="button"
                className={`segmented-control-btn ${audioMode === 'upload' ? 'active' : ''}`}
                style={{ fontSize: 11, padding: '3px 8px' }}
                onClick={() => setAudioMode('upload')}
              >
                Upload Audio File
              </button>
            </div>
          </div>
        </div>

        {audioMode === 'upload' ? (
          value.fileName ? (
            <div className="file-upload-preview">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Headphones size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {value.fileName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{value.fileSize} • Audio ready</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: 4, color: 'var(--text-muted)' }}
                onClick={handleRemoveFile}
                title="Remove audio"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              className="file-upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '24px 16px', textAlign: 'center', cursor: 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(31, 187, 210, 0.12)', color: 'var(--cyan)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px'
              }}>
                <Headphones size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                Upload Audio File (MP3, WAV, M4A)
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Drag & drop or click to browse
              </div>
            </div>
          )
        ) : (
          <div>
            <div style={{ position: 'relative' }}>
              <Link size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input"
                style={{ fontSize: 12, paddingLeft: 34 }}
                placeholder="https://cdn.example.com/audio/lesson-01.mp3"
                value={value.mediaUrl || ''}
                onChange={e => onChange({ ...value, mediaUrl: e.target.value })}
              />
            </div>
          </div>
        )}

        <div>
          <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Estimated Duration (MM:SS)
          </label>
          <div style={{ position: 'relative' }}>
            <Clock size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input"
              style={{ fontSize: 12, paddingLeft: 34 }}
              placeholder="e.g. 14:30"
              value={value.duration || '12:00'}
              onChange={e => onChange({ ...value, duration: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Episode Guide & Lecture Transcript
          </label>
          <textarea
            className="textarea"
            rows={4}
            style={{ fontSize: 12 }}
            placeholder="Key concepts discussed, timestamps, or full verbatim transcript..."
            value={value.content || ''}
            onChange={e => onChange({ ...value, content: e.target.value })}
          />
        </div>
      </div>
    );
  }

    return null;
  };

  const filteredAssets = (mediaAssets || []).filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (asset.usedInCourses || []).some(c => c.toLowerCase().includes(pickerSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (pickerFilter === 'all') return true;
    if (pickerFilter === 'slides') return asset.fileType === 'slides';
    if (pickerFilter === 'audio') return asset.fileType === 'audio';
    if (pickerFilter === 'video') return asset.fileType === 'video';
    if (pickerFilter === 'pdf') return asset.fileType === 'pdf';
    if (pickerFilter === 'image') return asset.fileType === 'image';
    return true;
  });

  return (
    <>
      {renderContent()}

      {showMediaPicker && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowMediaPicker(false)}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: 740, width: '92%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 'var(--border-subtle)', padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <HardDrive size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Select from Central Media Library</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Pick an existing asset or presentation deck to insert into this lesson block</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowMediaPicker(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Filter Bar */}
            <div style={{ padding: '12px 20px', borderBottom: 'var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: 34, fontSize: 13 }}
                  placeholder="Search media files by name, type, or course tag..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Files' },
                    { id: 'slides', label: 'Slide Decks' },
                    { id: 'audio', label: 'Audio' },
                    { id: 'video', label: 'Video' },
                    { id: 'pdf', label: 'PDF Documents' },
                    { id: 'image', label: 'Images' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`btn btn-sm ${pickerFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => setPickerFilter(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {filteredAssets.length} asset{filteredAssets.length === 1 ? '' : 's'} available
                </span>
              </div>
            </div>

            {/* Asset List */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredAssets.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <HardDrive size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>No assets match your search or filter.</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12 }}>Try searching another keyword or upload files in the Media Library.</p>
                </div>
              ) : (
                filteredAssets.map(asset => {
                  const isAudio = asset.fileType === 'audio';
                  const isSlides = asset.fileType === 'slides';
                  const isVideo = asset.fileType === 'video';
                  const isPdf = asset.fileType === 'pdf';

                  return (
                    <div
                      key={asset.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated, rgba(255,255,255,0.03))',
                        border: '1px solid var(--border-color)',
                        gap: 12,
                        transition: 'border-color 0.15s, background-color 0.15s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--cyan)';
                        e.currentTarget.style.backgroundColor = 'rgba(31, 187, 210, 0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated, rgba(255,255,255,0.03))';
                      }}
                      onClick={() => handleSelectMediaAsset(asset)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: isSlides ? 'rgba(31, 187, 210, 0.15)' : isAudio ? 'rgba(243, 156, 18, 0.15)' : isVideo ? 'rgba(31, 187, 210, 0.15)' : isPdf ? 'rgba(243, 156, 18, 0.15)' : 'rgba(23, 40, 59, 0.25)',
                          color: isSlides || isVideo ? 'var(--cyan)' : isAudio || isPdf ? 'var(--amber)' : 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {isSlides ? <Presentation size={20} /> : isAudio ? <Headphones size={20} /> : isVideo ? <Video size={20} /> : isPdf ? <FileText size={20} /> : <Layers size={20} />}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {asset.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)', marginTop: 2, flexWrap: 'wrap' }}>
                            <span>{asset.fileSize}</span>
                            <span>•</span>
                            <span>{asset.duration || asset.dimensions}</span>
                            {asset.usedInCourses && asset.usedInCourses.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="badge badge-subtle" style={{ fontSize: 10, padding: '1px 6px' }}>
                                  Used in: {asset.usedInCourses[0]}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          color: 'var(--cyan)',
                          borderColor: 'rgba(31, 187, 210, 0.4)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMediaAsset(asset);
                        }}
                      >
                        <Check size={14} /> Insert Asset
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ borderTop: 'var(--border-subtle)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Need a new file? Manage and upload in the <strong style={{ color: 'var(--text-primary)' }}>Media Library</strong>
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowMediaPicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
