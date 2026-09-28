import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import { DEMO_PRESET_MANIFEST } from '../../data/interactiveVideoPresets';
import {
  Video, Eye, Edit3, Download, Upload, RotateCcw, Check, Sparkles,
  HelpCircle, MapPin, GitFork, AlertCircle, FileText, ArrowRight,
  PlayCircle, RefreshCw, BookOpen, ArrowLeft, Save, ChevronDown, X
} from 'lucide-react';
import VideoDropzone from '../../components/video-studio/VideoDropzone';
import VideoPlayer from '../../components/video-studio/VideoPlayer';
import InteractionTimeline from '../../components/video-studio/InteractionTimeline';
import InteractionSidebar from '../../components/video-studio/InteractionSidebar';
import AddInteractionModal from '../../components/video-studio/AddInteractionModal';

const LOCAL_STORAGE_KEY = 'evergreen_interactive_video_manifest_v2';

function StudioDropdown({ value, options, placeholder, icon: Icon, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="ivs-dropdown-container" ref={ref}>
      <button
        type="button"
        className={`ivs-dropdown-trigger ${open ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        title={selectedOption ? selectedOption.label : placeholder}
      >
        {Icon && <Icon size={12} className="text-cyan ivs-dropdown-icon" />}
        <span className="ivs-dropdown-label">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={12} className={`ivs-dropdown-chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="ivs-dropdown-menu">
          <div className="ivs-dropdown-menu-inner">
            <button
              type="button"
              className={`ivs-dropdown-item ${!value ? 'selected' : ''}`}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <span style={{ opacity: 0.6 }}>-- {placeholder} --</span>
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`ivs-dropdown-item ${opt.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="ivs-dropdown-item-text">{opt.label}</span>
                {opt.value === value && <Check size={12} className="text-cyan check-icon" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveVideoStudio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const lessonId = searchParams.get('lessonId');
  const blockId = searchParams.get('blockId');

  const {
    courses = [],
    lessons = [],
    contentBlocks = [],
    updateContentBlock,
    addContentBlock,
    getLessonsForCourse
  } = useLms();

  const currentCourse = courses.find(c => c.id === courseId);
  const currentLesson = lessons.find(l => l.id === lessonId);
  const currentBlock = contentBlocks.find(b => b.id === blockId);

  // Fallback selector if opened directly from navigation
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || '');
  const [selectedLessonId, setSelectedLessonId] = useState(lessonId || '');

  const availableLessons = selectedCourseId && typeof getLessonsForCourse === 'function'
    ? getLessonsForCourse(selectedCourseId)
    : lessons;

  // Mode state: 'editor' | 'viewer'
  const [mode, setMode] = useState('editor');

  // Video state - default to demo preset video
  const [videoSrc, setVideoSrc] = useState(DEMO_PRESET_MANIFEST.videoSrc);
  const [videoName, setVideoName] = useState(DEMO_PRESET_MANIFEST.videoName);
  const [videoTitle, setVideoTitle] = useState(DEMO_PRESET_MANIFEST.videoTitle);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manifest interactions state - default to demo interactions
  const [interactions, setInteractions] = useState(DEMO_PRESET_MANIFEST.interactions);
  const [selectedInteraction, setSelectedInteraction] = useState(null);

  // Editor Modal & Coordinate Picking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [isCapturingCoords, setIsCapturingCoords] = useState(false);
  const [capturedCoords, setCapturedCoords] = useState(null);

  // Feedback banner / auto-save state
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [noticeMessage, setNoticeMessage] = useState(null);
  const fileInputRef = useRef(null);

  // 1. Load initial state: first check if loaded for a specific course block, then localStorage, then demo preset
  useEffect(() => {
    if (currentBlock?.payloadJson) {
      const p = currentBlock.payloadJson;
      if (p.mediaUrl) {
        setVideoSrc(p.mediaUrl);
        setVideoName(p.fileName || currentBlock.title || 'Lesson Video');
      }
      if (p.title) {
        setVideoTitle(p.title);
      }
      if (Array.isArray(p.interactions) && p.interactions.length > 0) {
        setInteractions(p.interactions);
      }
      showNotice(`Loaded video content for: ${currentLesson?.title || currentCourse?.title || 'Course Lesson'}`);
      return;
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const isOldBrokenUrl = parsed.videoSrc && parsed.videoSrc.includes('commondatastorage.googleapis.com');
        const hasOutdatedTimestamps = parsed.interactions && parsed.interactions.some(i => (i.triggerTime > 32 || i.startTime > 32));
        if (parsed.videoSrc && parsed.videoSrc.trim() !== '' && !isOldBrokenUrl && !hasOutdatedTimestamps) {
          setVideoSrc(parsed.videoSrc);
          setVideoName(parsed.videoName || 'Custom Video');
          if (parsed.videoTitle) setVideoTitle(parsed.videoTitle);
          if (Array.isArray(parsed.interactions) && parsed.interactions.length > 0) {
            setInteractions(parsed.interactions);
          } else {
            setInteractions(DEMO_PRESET_MANIFEST.interactions);
          }
          showNotice('Restored your draft manifest');
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved video manifest:', err);
    }

    // Default to educational demo preset
    loadPreset(DEMO_PRESET_MANIFEST, false);
  }, [blockId, lessonId]);

  // 2. Auto-save to localStorage when interactions or title change
  useEffect(() => {
    if (!videoSrc) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const payload = {
          videoTitle,
          videoName,
          videoSrc,
          interactions,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        console.warn('LocalStorage save error:', err);
        setSaveStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [interactions, videoTitle, videoName, videoSrc]);

  const showNotice = (msg) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Video selection callback from Dropzone
  const handleVideoSelected = ({ src, name, isLocalFile }) => {
    setVideoSrc(src);
    setVideoName(name);
    setCurrentTime(0);
    setIsPlaying(false);
    showNotice(`Loaded video: ${name}`);
  };

  // Load preset data
  const loadPreset = (preset, notify = true) => {
    setVideoSrc(preset.videoSrc);
    setVideoName(preset.videoName);
    setVideoTitle(preset.videoTitle);
    setInteractions(preset.interactions);
    setCurrentTime(0);
    setIsPlaying(false);
    setSelectedInteraction(null);
    if (notify) {
      showNotice('Loaded interactive demo preset with sample video and interactions');
    }
  };

  // Export to JSON file
  const handleExportJSON = () => {
    const manifest = {
      app: 'Evergreen LMS — Interactive Video Studio',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      videoTitle,
      videoName,
      videoDuration: duration,
      interactions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${videoTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotice('Manifest successfully exported as JSON');
  };

  // Import from JSON file
  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.interactions && Array.isArray(parsed.interactions)) {
          setInteractions(parsed.interactions);
          if (parsed.videoTitle) setVideoTitle(parsed.videoTitle);
          showNotice(`Imported manifest with ${parsed.interactions.length} interactions!`);
        } else {
          alert('Invalid manifest file: missing "interactions" array.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Clear / Reset all interactions
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all interactive nodes?')) {
      setInteractions([]);
      setSelectedInteraction(null);
      showNotice('Cleared all interactions');
    }
  };

  // Add / Save Interaction
  const handleSaveInteraction = (newOrUpdated) => {
    setInteractions((prev) => {
      const idx = prev.findIndex((i) => i.id === newOrUpdated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newOrUpdated;
        return next;
      }
      return [...prev, newOrUpdated];
    });

    setIsModalOpen(false);
    setEditingInteraction(null);
    setIsCapturingCoords(false);
    setCapturedCoords(null);
    setSelectedInteraction(newOrUpdated);
    showNotice(`Saved "${newOrUpdated.title || newOrUpdated.type}" interaction`);
  };

  // Delete Interaction
  const handleDeleteInteraction = (id) => {
    if (window.confirm('Delete this interaction?')) {
      setInteractions((prev) => prev.filter((i) => i.id !== id));
      if (selectedInteraction?.id === id) {
        setSelectedInteraction(null);
      }
      showNotice('Interaction removed');
    }
  };

  // Duplicate Interaction
  const handleDuplicateInteraction = (item) => {
    const duplicated = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      title: `${item.title} (Copy)`,
      startTime: item.type === 'hotspot' ? Math.floor(currentTime) : undefined,
      endTime: item.type === 'hotspot' ? Math.floor(currentTime) + (item.endTime - item.startTime) : undefined,
      triggerTime: item.type !== 'hotspot' ? Math.floor(currentTime) : undefined
    };
    setInteractions((prev) => [...prev, duplicated]);
    showNotice(`Duplicated "${item.title}" to current timestamp`);
  };

  // Open modal for editing
  const handleEditInteraction = (item) => {
    setEditingInteraction(item);
    setIsModalOpen(true);
  };

  // Coordinate capture from video click
  const handleStartCoordPick = () => {
    setIsCapturingCoords(true);
    showNotice('Coordinate Pick Mode: Click on the paused video frame to position');
  };

  const handleCoordsCaptured = ({ x, y }) => {
    setCapturedCoords({ x, y });
    setIsCapturingCoords(false);
    showNotice(`Position captured: ${x}% , ${y}%`);
  };

  // Save directly to course lesson in LMS context
  const handleSaveToCourse = () => {
    const targetCourseId = courseId || selectedCourseId;
    const targetLessonId = lessonId || selectedLessonId;

    if (!targetLessonId) {
      alert('Please select a course lesson to attach this interactive video.');
      return;
    }

    const durFormatted = duration
      ? `${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(Math.floor(duration % 60)).padStart(2, '0')}`
      : '00:33';

    let targetBlockId = blockId;
    if (!targetBlockId) {
      const existing = (contentBlocks || []).find(b => b.lessonId === targetLessonId && (b.type === 'interactive' || b.type === 'interactive_video'));
      if (existing) {
        targetBlockId = existing.id;
      } else {
        targetBlockId = addContentBlock(targetLessonId, {
          type: 'interactive',
          title: videoTitle || 'Interactive Video',
          desc: 'Interactive video lesson with timed checkpoints',
          payloadJson: {
            title: videoTitle,
            mediaUrl: videoSrc,
            fileName: videoName,
            duration: durFormatted,
            interactions
          }
        });
      }
    }

    if (targetBlockId) {
      updateContentBlock(targetBlockId, {
        title: videoTitle,
        payloadJson: {
          title: videoTitle,
          mediaUrl: videoSrc,
          fileName: videoName,
          duration: durFormatted,
          interactions
        }
      });
    }

    showNotice('Saved interactive video to course lesson!');
    setTimeout(() => {
      if (targetCourseId) {
        navigate(`/admin/courses/${targetCourseId}/author`);
      } else {
        navigate('/admin/courses');
      }
    }, 600);
  };

  return (
    <div className="page-content ivs-page-container">
      {/* Top Studio Header */}
      <div className="ivs-header-bar glass-card-static">
        <div className="ivs-header-left">
          <div className="ivs-brand-pill">
            <Video size={18} className="text-cyan" />
            <span>VIDEO STUDIO</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                className="ivs-title-input"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter Lesson Title..."
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 4, flexWrap: 'wrap' }}>
              <span className="ivs-header-subtext">
                100% Client-Side Interactive Video Engine • {interactions.length} Interactive Nodes
              </span>

              {/* Course & Lesson Context Badge */}
              {currentCourse && currentLesson ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="badge" style={{
                    background: 'rgba(6, 182, 212, 0.12)', color: 'var(--cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.3)', display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11
                  }}>
                    <BookOpen size={11} />
                    {currentCourse.title} &rsaquo; {currentLesson.title}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0 6px', fontSize: 11, color: 'var(--text-muted)' }}
                    onClick={() => navigate(`/admin/courses/${courseId}/author`)}
                  >
                    Back to Authoring
                  </button>
                </div>
              ) : (
                /* Fallback Course & Lesson Selector if opened from sidebar */
                courses.length > 0 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <StudioDropdown
                      value={selectedCourseId}
                      options={courses.map(c => ({ value: c.id, label: c.title }))}
                      placeholder="Attach to Course"
                      icon={BookOpen}
                      onChange={(newCourseId) => {
                        setSelectedCourseId(newCourseId);
                        setSelectedLessonId('');
                      }}
                    />

                    {selectedCourseId && (
                      <StudioDropdown
                        value={selectedLessonId}
                        options={availableLessons.map(l => ({ value: l.id, label: l.title }))}
                        placeholder="Select Lesson"
                        icon={Video}
                        onChange={(newLessonId) => setSelectedLessonId(newLessonId)}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions: Mode Switcher & Tools */}
        <div className="ivs-header-right">
          {/* Auto-save Status Indicator */}
          <div className="ivs-save-badge">
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw size={12} className="spin-icon text-cyan" />
                <span>Auto-saving...</span>
              </>
            ) : (
              <>
                <Check size={13} className="text-emerald" />
                <span>Local Draft Saved</span>
              </>
            )}
          </div>

          {/* DUAL MODE TOGGLE SWITCH */}
          <div className="ivs-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mode === 'editor' ? 'active' : ''}`}
              onClick={() => setMode('editor')}
              title="Editor Mode: author hotspots, decisions, and inspect timeline"
            >
              <Edit3 size={15} />
              <span>Editor Mode</span>
            </button>

            <button
              type="button"
              className={`mode-btn ${mode === 'viewer' ? 'active' : ''}`}
              onClick={() => setMode('viewer')}
              title="Viewer Mode: clean end-user video playback"
            >
              <Eye size={15} />
              <span>Viewer Preview</span>
            </button>
          </div>

          {/* Utility Dropdown / Buttons */}
          <div className="ivs-utility-buttons">
            {/* Primary Save & Return to Lesson CTA */}
            {(courseId || selectedLessonId) && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveToCourse}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                title="Save video and all authored interactive nodes directly to course lesson"
              >
                <Save size={14} />
                <span>Save to Lesson</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loadPreset(DEMO_PRESET_MANIFEST)}
              title="Reset and load educational lecture video with pre-configured checkpoints"
            >
              <Sparkles size={14} /> Educational Preset
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleImportJSONClick}
              title="Import JSON configuration file"
            >
              <Upload size={14} /> Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportJSON}
              title="Download interactive video manifest as JSON"
            >
              <Download size={14} /> Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notice Banner */}
      {noticeMessage && (
        <div className="ivs-notice-toast">
          <Sparkles size={14} className="text-cyan" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Mode Status Banner */}
      <div className={`ivs-mode-banner ${mode === 'editor' ? 'banner-editor' : 'banner-viewer'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {mode === 'editor' ? (
            <>
              <Edit3 size={15} />
              <span>
                <strong>Editor Mode Active:</strong> Scrub the timeline, click anywhere on the video frame to pick coordinates, and author interactive branches or quizzes.
              </span>
            </>
          ) : (
            <>
              <Eye size={15} />
              <span>
                <strong>Viewer Preview Mode:</strong> Clean end-user playback experience. Interactive overlays will automatically pause and prompt the viewer at configured timestamps.
              </span>
            </>
          )}
        </div>

        {mode === 'editor' && isCapturingCoords && (
          <span className="badge badge-draft" style={{ animation: 'pulse 1.5s infinite' }}>
            Coordinate Pick Mode Active
          </span>
        )}
      </div>

      {/* Video Dropzone (if no video selected) */}
      {!videoSrc ? (
        <VideoDropzone onVideoSelected={handleVideoSelected} />
      ) : (
        /* Video Loaded Layout */
        <div className="ivs-main-workspace">
          {/* Loaded video mini-bar */}
          <VideoDropzone
            currentVideoSrc={videoSrc}
            currentVideoName={videoName}
            onChangeVideo={() => setVideoSrc('')}
          />

          {mode === 'editor' ? (
            /* ════════ EDITOR MODE LAYOUT (2 Columns) ════════ */
            <div className="ivs-editor-grid">
              {/* Left Column: Player + Controls + Timeline */}
              <div className="ivs-editor-main">
                <VideoPlayer
                  videoSrc={videoSrc}
                  interactions={interactions}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  isEditor={true}
                  selectedInteractionId={selectedInteraction?.id}
                  onSelectInteraction={setSelectedInteraction}
                  onTimeUpdate={setCurrentTime}
                  onDurationChange={setDuration}
                  onPlayStateChange={setIsPlaying}
                  onSeek={setCurrentTime}
                  isCapturingCoords={isCapturingCoords}
                  onCoordsCaptured={handleCoordsCaptured}
                  capturedCoords={capturedCoords}
                  onSwitchToLocalDemo={() => loadPreset(DEMO_PRESET_MANIFEST)}
                />

                {/* Timeline Component */}
                <InteractionTimeline
                  duration={duration}
                  currentTime={currentTime}
                  interactions={interactions}
                  onSeek={setCurrentTime}
                  onSelectInteraction={setSelectedInteraction}
                  selectedInteractionId={selectedInteraction?.id}
                />
              </div>

              {/* Right Column: Interaction Sidebar */}
              <div className="ivs-editor-aside">
                <InteractionSidebar
                  interactions={interactions}
                  currentTime={currentTime}
                  selectedInteractionId={selectedInteraction?.id}
                  onSelectInteraction={setSelectedInteraction}
                  onOpenAddModal={() => {
                    setEditingInteraction(null);
                    setIsModalOpen(true);
                  }}
                  onEditInteraction={handleEditInteraction}
                  onDeleteInteraction={handleDeleteInteraction}
                  onDuplicateInteraction={handleDuplicateInteraction}
                  onSeekToInteraction={setCurrentTime}
                />
              </div>
            </div>
          ) : (
            /* ════════ VIEWER MODE LAYOUT (Clean Focused Player) ════════ */
            <div className="ivs-viewer-wrapper">
              <div className="ivs-viewer-player-card glass-card-static">
                <VideoPlayer
                  videoSrc={videoSrc}
                  interactions={interactions}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  isEditor={false}
                  onTimeUpdate={setCurrentTime}
                  onDurationChange={setDuration}
                  onPlayStateChange={setIsPlaying}
                  onSeek={setCurrentTime}
                  onSwitchToLocalDemo={() => loadPreset(DEMO_PRESET_MANIFEST)}
                />
              </div>

              {/* Viewer Footnote Info */}
              <div className="ivs-viewer-footer-info">
                <div className="ivs-viewer-stats">
                  <span className="stat-pill">
                    <MapPin size={13} className="text-cyan" /> {interactions.filter(i => i.type === 'hotspot').length} Hotspots
                  </span>
                  <span className="stat-pill">
                    <GitFork size={13} className="text-amber" /> {interactions.filter(i => i.type === 'branching').length} Decision Points
                  </span>
                  <span className="stat-pill">
                    <HelpCircle size={13} className="text-emerald" /> {interactions.filter(i => i.type === 'quiz').length} Checkpoint Quizzes
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setMode('editor')}
                >
                  <Edit3 size={14} /> Back to Editor Mode
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Interaction Modal */}
      <AddInteractionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInteraction(null);
          setIsCapturingCoords(false);
        }}
        onSave={handleSaveInteraction}
        currentTime={currentTime}
        duration={duration}
        interactionToEdit={editingInteraction}
        capturedCoords={capturedCoords}
        onStartCoordPick={handleStartCoordPick}
      />
    </div>
  );
}
