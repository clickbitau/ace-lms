import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ContentUploader from '../../components/ContentUploader';
import CourseLandingSection from '../../components/CourseLandingSection';
import ContentBlockPreview from '../../components/ContentBlockPreview';
import {
  ChevronDown, ChevronRight, ChevronLeft, GripVertical, Plus, Eye, Upload,
  Video, Sparkles, Type, FileText, HelpCircle, CheckSquare,
  MoreVertical, CheckCircle2, X, Edit3, Trash2, Copy, Check,
  Sliders, ArrowDown, ExternalLink,
  GraduationCap, Play, RefreshCw, Layers, Presentation, Headphones, HardDrive
} from 'lucide-react';

export default function CourseAuthoring() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    courses, sections, lessons, courseVersions, publishCourseVersion,
    addSection, updateSection, deleteSection,
    addLesson, updateLesson, deleteLesson,
    addContentBlock, updateContentBlock, deleteContentBlock,
    contentBlocks: allContentBlocks,
  } = useLms();

  const course = courses.find(c => c.id === courseId) || courses[0];
  const courseVersionsList = (courseVersions || []).filter(v => v.courseId === course?.id);
  const version = (courseVersions || []).find(v => v.id === course?.publishedVersionId)
    || (courseVersionsList.length > 0 ? courseVersionsList[courseVersionsList.length - 1] : null);
  const activeVersionId = version?.id || course?.publishedVersionId || (course ? `cv-${course.id}` : null);

  const courseSections = sections
    .filter(s => {
      if (activeVersionId && s.courseVersionId === activeVersionId) return true;
      if (course?.publishedVersionId && s.courseVersionId === course.publishedVersionId) return true;
      if (courseVersionsList.some(v => v.id === s.courseVersionId)) return true;
      if (!s.courseVersionId && s.courseId === course?.id) return true;
      return false;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Helper to strip redundant "Module X:" prefix if user entered it
  const cleanModuleTitle = (title) => {
    if (!title) return '';
    const cleaned = title.replace(/^Module\s*\d+\s*:\s*/i, '').trim();
    return cleaned || title;
  };

  // Helper to fetch lessons for a section
  const getLessons = (sectionId) => lessons.filter(l => l.sectionId === sectionId).sort((a, b) => a.sortOrder - b.sortOrder);

  // Initial selection
  const initialLesson = courseSections[0] ? getLessons(courseSections[0].id)[0] : null;
  const [selectedLesson, setSelectedLesson] = useState(initialLesson?.id || null);
  const [expandedSections, setExpandedSections] = useState(new Set(courseSections.map(s => s.id)));
  const [saved, setSaved] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessNotice, setPublishSuccessNotice] = useState(null);

  useEffect(() => {
    if (!selectedLesson && courseSections.length > 0) {
      const firstSecLessons = getLessons(courseSections[0].id);
      if (firstSecLessons.length > 0) {
        setSelectedLesson(firstSecLessons[0].id);
      }
    }
  }, [courseSections, selectedLesson]);

  // Active Dropdown Menus
  const [activeLessonMenu, setActiveLessonMenu] = useState(null); // lessonId
  const [activeBlockMenu, setActiveBlockMenu] = useState(null); // blockId

  // Modals state
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1540 : false;
  });

  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonRequired, setNewLessonRequired] = useState(true);
  const [contentTypeDropdownOpen, setContentTypeDropdownOpen] = useState(false);
  const [newLessonPayload, setNewLessonPayload] = useState({
    fileName: '',
    fileSize: '',
    fileUrl: '',
    mediaUrl: '',
    duration: '12:00',
    content: '## Lesson Guide\n\nWelcome to this lesson! You can write detailed instructions, articles, or guides here.\n\n- Key Point 1\n- Key Point 2\n- Next steps',
    questions: [
      { id: 'q1', prompt: 'What is the primary objective of this lesson?', options: ['Foundational setup', 'Performance tuning', 'Legacy maintenance', 'Manual QA'], correctIdx: 0 }
    ],
    passingScore: 75,
    checklistItems: ['Review module reference guide', 'Complete the setup tasks', 'Verify tests pass'],
  });

  const [editLessonModal, setEditLessonModal] = useState(null); // { id, title, isRequired }
  const [editBlockModal, setEditBlockModal] = useState(null); // { id, title, desc, req, type, payload }
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockType, setNewBlockType] = useState('video');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockDesc, setNewBlockDesc] = useState('');
  const [addBlockDropdownOpen, setAddBlockDropdownOpen] = useState(false);
  const [newBlockPayload, setNewBlockPayload] = useState({
    fileName: '',
    fileSize: '',
    fileUrl: '',
    mediaUrl: '',
    duration: '10:00',
    content: '## Additional Notes\n\nKey takeaways and best practice highlights.',
    questions: [
      { id: 'q1', prompt: 'What is the primary benefit?', options: ['Increased efficiency', 'Complexity', 'Redundancy', 'Manual overhead'], correctIdx: 0 }
    ],
    passingScore: 75,
    checklistItems: ['Complete exercise', 'Submit work for feedback'],
  });

  // Course Preview states
  const [centerPaneTab, setCenterPaneTab] = useState('edit'); // 'edit' | 'preview'
  const [activeAuthoringTab, setActiveAuthoringTab] = useState('curriculum'); // 'curriculum' | 'content' | 'settings' (for mobile/tablet tabs)
  const [showPreviewChoiceModal, setShowPreviewChoiceModal] = useState(false);
  const [previewBlockModal, setPreviewBlockModal] = useState(null);

  const contentTypeOptions = [
    { value: 'video', label: 'Video Lecture', icon: Video, color: '#1fbbd2', desc: 'Standard video stream & player' },
    { value: 'interactive', label: 'Interactive Video', icon: Sparkles, color: '#1fbbd2', desc: 'Pauses with embedded quiz checkpoints' },
    { value: 'presentation', label: 'Presentation Slides', icon: Presentation, color: '#1fbbd2', desc: 'Slide deck (Google Slides, Canva, PPT/PDF)' },
    { value: 'audio', label: 'Audio Lecture', icon: Headphones, color: '#f39c12', desc: 'Audio recording, podcast episode & transcript' },
    { value: 'text', label: 'Rich Text / Article', icon: Type, color: '#17283b', desc: 'Formatted text, code blocks & reading material' },
    { value: 'pdf', label: 'PDF Document', icon: FileText, color: '#f39c12', desc: 'Downloadable syllabus, worksheet, or handbook' },
    { value: 'quiz', label: 'Assessment Quiz', icon: HelpCircle, color: '#1fbbd2', desc: 'Graded quiz with passing score threshold' },
    { value: 'checklist', label: 'Action Checklist', icon: CheckSquare, color: '#17283b', desc: 'Interactive step-by-step task checklist' },
  ];

  // Close menus on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveLessonMenu(null);
      setActiveBlockMenu(null);
      setContentTypeDropdownOpen(false);
      setAddBlockDropdownOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const toggleSection = (id) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedLessonData = lessons.find(l => l.id === selectedLesson) || lessons[0];
  const isParentRequired = selectedLessonData ? selectedLessonData.isRequired : true;

  // Get blocks for selected lesson
  const currentBlocks = allContentBlocks
    .filter(b => b.lessonId === selectedLessonData?.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Fallback demo blocks if a lesson doesn't have custom blocks yet
  const defaultBlockTemplates = [
    { id: `demo-1-${selectedLessonData?.id}`, lessonId: selectedLessonData?.id, type: 'video', title: 'Video Lecture', desc: 'Play a high-definition video file.', req: true },
    { id: `demo-2-${selectedLessonData?.id}`, lessonId: selectedLessonData?.id, type: 'interactive', title: 'Interactive Video', desc: 'Video with interactive pauses and questions.', req: true },
    { id: `demo-3-${selectedLessonData?.id}`, lessonId: selectedLessonData?.id, type: 'text', title: 'Text Guide', desc: 'Add rich text, headings, and detailed explanation.', req: true },
    { id: `demo-4-${selectedLessonData?.id}`, lessonId: selectedLessonData?.id, type: 'pdf', title: 'PDF Document', desc: 'Upload a reference PDF for learners to download.', req: false },
    { id: `demo-5-${selectedLessonData?.id}`, lessonId: selectedLessonData?.id, type: 'quiz', title: 'Knowledge Quiz', desc: 'Add questions to assess understanding.', req: true },
    { id: `demo-6-${selectedLessonData?.id}`, lessonId: selectedLessonData?.id, type: 'checklist', title: 'Completion Checklist', desc: 'Learners check off tasks to finish.', req: false },
  ];

  // Guaranteed synchronization between lesson requirement and its content blocks:
  // If the parent lesson is Optional, its blocks are also displayed as Optional.
  const displayedBlocks = currentBlocks.length > 0
    ? currentBlocks.map(b => ({
        id: b.id,
        lessonId: b.lessonId,
        type: b.type,
        title: b.payloadJson?.title || b.title || `${b.type.toUpperCase()} Block`,
        desc: b.payloadJson?.desc || b.desc || `Content block for ${selectedLessonData?.title}`,
        req: !isParentRequired ? false : (b.req !== undefined ? b.req : true),
      }))
    : defaultBlockTemplates.map(b => ({
        ...b,
        req: !isParentRequired ? false : b.req,
      }));

  // Completion Rules State
  const [completionRules, setCompletionRules] = useState({
    viewed: true,
    videoPercentage: true,
    videoPercent: 80,
    quizPassed: true,
    quizThreshold: 70,
    acknowledged: false,
  });

  const [completionMsg, setCompletionMsg] = useState("Great job! You've completed this lesson.");

  const handlePublish = () => {
    setIsPublishing(true);
    const wasDraft = course.status === 'Draft' || !course.publishedVersionId;
    setTimeout(() => {
      try {
        publishCourseVersion(course.id);
        setSaved(true);
        setIsPublishing(false);
        setPublishSuccessNotice({
          type: 'success',
          title: wasDraft ? '🎉 Course Published Successfully!' : '🚀 New Version & Updates Published!',
          message: `"${course.title}" is live. Students can now explore and enroll in this course.`,
        });
        setTimeout(() => {
          setPublishSuccessNotice(null);
        }, 6000);
      } catch (err) {
        console.error('Publish error:', err);
        setIsPublishing(false);
      }
    }, 250);
  };

  // Add Module Handler
  const handleCreateModule = (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    const finalTitle = cleanModuleTitle(newModuleTitle.trim());
    const targetVersionId = activeVersionId || (course ? `cv-${course.id}` : null);
    const newId = addSection(targetVersionId, finalTitle, course?.id);
    setExpandedSections(prev => new Set([...prev, newId]));
    setNewModuleTitle('');
    setShowAddModuleModal(false);
    setSaved(true);
  };

  // Add Lesson Handler
  const handleOpenAddLesson = (secId, e) => {
    e.stopPropagation();
    setTargetSectionId(secId);
    setNewLessonTitle('');
    setNewLessonType('video');
    setNewLessonRequired(true);
    setNewLessonPayload({
      fileName: '',
      fileSize: '',
      fileUrl: '',
      mediaUrl: '',
      duration: '12:00',
      content: '## Lesson Guide\n\nWelcome to this lesson! You can write detailed instructions, articles, or guides here.\n\n- Key Point 1\n- Key Point 2\n- Next steps',
      questions: [
        { id: 'q1', prompt: 'What is the primary objective of this lesson?', options: ['Foundational setup', 'Performance tuning', 'Legacy maintenance', 'Manual QA'], correctIdx: 0 }
      ],
      passingScore: 75,
      checklistItems: ['Review module reference guide', 'Complete the setup tasks', 'Verify tests pass'],
    });
    setContentTypeDropdownOpen(false);
    setShowAddLessonModal(true);
  };

  const handleCreateLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !targetSectionId) return;
    const newLesId = addLesson(targetSectionId, {
      title: newLessonTitle.trim(),
      type: newLessonType,
      isRequired: newLessonRequired,
      duration: newLessonPayload.duration || '10:00',
      desc: newLessonPayload.fileName
        ? `Document: ${newLessonPayload.fileName} (${newLessonPayload.fileSize})`
        : newLessonPayload.content
        ? `${newLessonPayload.content.slice(0, 60)}...`
        : `${newLessonType} for ${newLessonTitle.trim()}`,
      payloadJson: {
        title: newLessonTitle.trim(),
        desc: newLessonPayload.fileName
          ? `Document: ${newLessonPayload.fileName} (${newLessonPayload.fileSize})`
          : `${newLessonType} for ${newLessonTitle.trim()}`,
        ...newLessonPayload,
      }
    });
    setSelectedLesson(newLesId);
    setShowAddLessonModal(false);
    setSaved(true);
  };

  // Toggle Lesson Required and Sync all blocks
  const handleToggleLessonRequirement = (lessonId, currentRequired) => {
    const nextRequired = !currentRequired;
    updateLesson(lessonId, { isRequired: nextRequired });
    // Also explicitly sync any existing blocks in store for this lesson
    allContentBlocks
      .filter(b => b.lessonId === lessonId)
      .forEach(b => updateContentBlock(b.id, { req: nextRequired }));
    setSaved(true);
  };

  // Rename Lesson Handler
  const handleSaveLessonEdit = (e) => {
    e.preventDefault();
    if (!editLessonModal || !editLessonModal.title.trim()) return;
    updateLesson(editLessonModal.id, {
      title: editLessonModal.title.trim(),
      isRequired: editLessonModal.isRequired,
    });
    // Sync blocks with edited isRequired
    allContentBlocks
      .filter(b => b.lessonId === editLessonModal.id)
      .forEach(b => updateContentBlock(b.id, { req: editLessonModal.isRequired }));
    setEditLessonModal(null);
    setSaved(true);
  };

  // Add Content Block Handler
  const handleCreateContentBlock = (e) => {
    e.preventDefault();
    if (!selectedLessonData || !newBlockTitle.trim()) return;
    addContentBlock(selectedLessonData.id, {
      type: newBlockType,
      title: newBlockTitle.trim(),
      desc: newBlockDesc.trim() || (newBlockPayload.fileName ? `${newBlockPayload.fileName} (${newBlockPayload.fileSize})` : `Content for ${newBlockTitle.trim()}`),
      req: selectedLessonData.isRequired,
      payloadJson: {
        title: newBlockTitle.trim(),
        desc: newBlockDesc.trim() || (newBlockPayload.fileName ? `${newBlockPayload.fileName} (${newBlockPayload.fileSize})` : `Content for ${newBlockTitle.trim()}`),
        ...newBlockPayload,
      }
    });
    setNewBlockTitle('');
    setNewBlockDesc('');
    setShowAddBlockModal(false);
    setSaved(true);
  };

  // Save Block Edit Handler
  const handleSaveBlockEdit = (e) => {
    e.preventDefault();
    if (!editBlockModal || !editBlockModal.title.trim()) return;
    updateContentBlock(editBlockModal.id, {
      type: editBlockModal.type,
      payloadJson: {
        title: editBlockModal.title.trim(),
        desc: editBlockModal.desc.trim() || (editBlockModal.payload?.fileName ? `${editBlockModal.payload.fileName} (${editBlockModal.payload.fileSize})` : ''),
        ...(editBlockModal.payload || {}),
      },
      req: editBlockModal.req,
    });
    setEditBlockModal(null);
    setSaved(true);
  };

  const getBlockIcon = (type) => {
    switch (type) {
      case 'video': return { icon: Video, color: 'video' };
      case 'interactive':
      case 'interactive_video': return { icon: Sparkles, color: 'interactive' };
      case 'presentation':
      case 'slides': return { icon: Presentation, color: 'interactive' };
      case 'audio':
      case 'podcast': return { icon: Headphones, color: 'pdf' };
      case 'text': return { icon: Type, color: 'text' };
      case 'pdf': return { icon: FileText, color: 'pdf' };
      case 'quiz': return { icon: HelpCircle, color: 'quiz' };
      case 'checklist': return { icon: CheckSquare, color: 'checklist' };
      default: return { icon: FileText, color: 'text' };
    }
  };

  return (
    <div style={{ height: 'calc(100vh - var(--topbar-height))', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Authoring Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52, flexShrink: 0, borderBottom: 'var(--border-subtle)',
        background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)', zIndex: 10,
        position: 'sticky', top: 0, gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box'
      }}>
        {/* Left: Breadcrumbs & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 1, overflow: 'hidden' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/admin/courses')}
            style={{ flexShrink: 0, padding: '4px 8px', fontSize: 13 }}
            title="Return to Courses list"
          >
            ← Courses
          </button>
          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>/</span>
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 240,
              display: 'inline-block'
            }}
            title={course.title}
          >
            {course.title}
          </span>
          <span
            className={`badge ${course.status === 'Published' ? 'badge-published' : course.status === 'Draft' ? 'badge-draft' : 'badge-archived'}`}
            style={{ flexShrink: 0, fontSize: 11, padding: '2px 7px' }}
          >
            {course.status === 'Published' ? '● Published' : course.status}
          </span>
          {version && (
            <span className="badge badge-active" style={{ flexShrink: 0, fontSize: 10, padding: '1px 6px' }}>
              v{version.versionNumber}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--emerald)', fontSize: 12, marginRight: 2 }}>
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              document.getElementById('pricing-landing-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
            title="Scroll down to Pricing, Thumbnail & Features section"
          >
            <ArrowDown size={13} style={{ color: 'var(--cyan)' }} />
            <span>Pricing & Landing</span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 4,
              background: 'rgba(2, 132, 199, 0.12)',
              color: 'var(--cyan)'
            }}>
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </span>
          </button>
          <button
            type="button"
            className={`btn ${isSettingsDrawerOpen ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setIsSettingsDrawerOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12
            }}
            title={isSettingsDrawerOpen ? "Close Lesson Rules Drawer" : "Open Lesson Rules & Completion Settings Drawer"}
          >
            <Sliders size={13} style={{ color: isSettingsDrawerOpen ? '#ffffff' : 'var(--amber)' }} />
            <span>Rules Drawer</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPreviewChoiceModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--cyan)'
            }}
            title="Preview how students see this course or view public landing page"
          >
            <Eye size={14} /> Preview Course
          </button>
          <button
            className={`btn btn-sm ${course.status === 'Published' ? 'btn-success' : 'btn-primary'}`}
            onClick={handlePublish}
            disabled={isPublishing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 92,
              justifyContent: 'center',
              fontWeight: 600,
              boxShadow: course.status === 'Published' ? '0 2px 10px rgba(16, 185, 129, 0.3)' : undefined
            }}
            title={course.status === 'Published' ? 'Publish changes / new version to production' : 'Publish course to make it available to students'}
          >
            {isPublishing ? (
              <>
                <RefreshCw size={14} className="spin-slow" />
                <span>Publishing...</span>
              </>
            ) : course.status === 'Published' ? (
              <>
                <Check size={14} />
                <span>Published</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Publish Success Banner */}
      {publishSuccessNotice && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.16) 0%, rgba(6, 182, 212, 0.16) 100%)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 9,
          position: 'sticky',
          top: 52,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: 'var(--emerald)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
            }}>
              <Check size={16} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                {publishSuccessNotice.title}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                {publishSuccessNotice.message}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={`/course/${course.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--cyan)' }}
            >
              <ExternalLink size={12} /> View Public Landing Page
            </a>
            <button
              className="btn btn-ghost btn-icon"
              style={{ padding: 4 }}
              onClick={() => setPublishSuccessNotice(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile / Tablet Tab Switcher for Three-Pane Layout */}
      <div className="authoring-mobile-tabs">
        <button
          type="button"
          className={`authoring-tab-btn ${activeAuthoringTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveAuthoringTab('curriculum')}
        >
          <Layers size={14} /> Curriculum
        </button>
        <button
          type="button"
          className={`authoring-tab-btn ${activeAuthoringTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveAuthoringTab('content')}
        >
          <Edit3 size={14} /> Content Editor
        </button>
        <button
          type="button"
          className={`authoring-tab-btn ${isSettingsDrawerOpen ? 'active' : ''}`}
          onClick={() => setIsSettingsDrawerOpen(prev => !prev)}
        >
          <Sliders size={14} /> Lesson Rules
        </button>
      </div>

      {/* ── SECTION 1 (FIRST): Course Curriculum (Modules, Lessons & Content Blocks) ── */}
      <div id="curriculum-section" className={`authoring-workspace ${isSettingsDrawerOpen ? 'has-rules-open' : 'has-rules-closed'}`}>
        {/* ── Left Pane: Course Structure ── */}
        <div className={`pane authoring-pane-curriculum ${activeAuthoringTab === 'curriculum' ? 'pane-active-mobile' : ''}`}>
          <div className="pane-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: 15, margin: 0, textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Course Structure</h3>
          </div>
          <div className="pane-body">
            {courseSections.map((sec, secIdx) => {
              const secLessons = getLessons(sec.id);
              const isExpanded = expandedSections.has(sec.id);
              return (
                <div key={sec.id} style={{ marginBottom: 12 }}>
                  <div
                    className="accordion-header"
                    onClick={() => toggleSection(sec.id)}
                    style={{ padding: '10px 12px', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                      <GripVertical size={13} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
                      {isExpanded ? <ChevronDown size={15} style={{ flexShrink: 0 }} /> : <ChevronRight size={15} style={{ flexShrink: 0 }} />}
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`Module ${secIdx + 1}: ${cleanModuleTitle(sec.title)}`}>
                        M{secIdx + 1}: {cleanModuleTitle(sec.title)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '2px 5px', color: 'var(--cyan)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/learn/${course.id}?preview=true`);
                        }}
                        title="Preview this course & module in student player"
                      >
                        <Eye size={13} />
                      </button>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald)' }} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ paddingLeft: 6, marginTop: 4 }}>
                      {secLessons.map((les, lesIdx) => (
                        <div
                          key={les.id}
                          className={`lesson-item ${selectedLesson === les.id ? 'active' : ''}`}
                          onClick={() => setSelectedLesson(les.id)}
                          style={{ margin: '2px 0', padding: '7px 8px', gap: 6, position: 'relative' }}
                        >
                          <GripVertical size={12} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
                          <span
                            className="lesson-title"
                            style={{ fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={`Lesson ${lesIdx + 1}: ${les.title}`}
                          >
                            Lesson {lesIdx + 1}: {les.title}
                          </span>
                          <span
                            className={`badge ${les.isRequired ? 'badge-required' : 'badge-optional'}`}
                            style={{
                              flexShrink: 0,
                              fontSize: 9,
                              padding: '1px 5px',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              borderRadius: 4
                            }}
                            title={les.isRequired ? 'Required lesson for course completion' : 'Optional supplementary lesson'}
                          >
                            {les.isRequired ? 'REQ' : 'OPT'}
                          </span>

                          {/* Left 3-Dot Action Menu Button */}
                          <div className="action-dropdown-container" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '3px 5px', color: activeLessonMenu === les.id ? 'var(--cyan)' : 'var(--text-muted)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveBlockMenu(null);
                                setActiveLessonMenu(activeLessonMenu === les.id ? null : les.id);
                              }}
                              title="Lesson Actions"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeLessonMenu === les.id && (
                              <div className="action-dropdown" style={{ right: 0, minWidth: 195 }}>
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setActiveLessonMenu(null);
                                    setSelectedLesson(les.id);
                                    setCenterPaneTab('preview');
                                  }}
                                >
                                  <Eye size={13} style={{ color: 'var(--cyan)' }} /> Student View Live Preview
                                </button>
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setActiveLessonMenu(null);
                                    setEditLessonModal({ id: les.id, title: les.title, isRequired: les.isRequired });
                                  }}
                                >
                                  <Edit3 size={13} style={{ color: 'var(--cyan)' }} /> Edit / Rename
                                </button>
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setActiveLessonMenu(null);
                                    setSelectedLesson(les.id);
                                    setIsSettingsDrawerOpen(true);
                                  }}
                                >
                                  <Sliders size={13} style={{ color: 'var(--amber)' }} /> Lesson Rules (Settings)
                                </button>
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setActiveLessonMenu(null);
                                    handleToggleLessonRequirement(les.id, les.isRequired);
                                  }}
                                >
                                  <Check size={13} style={{ color: 'var(--emerald)' }} />
                                  Make {les.isRequired ? 'Optional' : 'Required'}
                                </button>
                                <button
                                  className="action-dropdown-item"
                                  onClick={() => {
                                    setActiveLessonMenu(null);
                                    const dupId = addLesson(sec.id, {
                                      title: `${les.title} (Copy)`,
                                      type: les.type,
                                      isRequired: les.isRequired,
                                    });
                                    setSelectedLesson(dupId);
                                    setSaved(true);
                                  }}
                                >
                                  <Copy size={13} style={{ color: 'var(--amber)' }} /> Duplicate
                                </button>
                                <div className="action-dropdown-divider" />
                                <button
                                  className="action-dropdown-item danger"
                                  onClick={() => {
                                    setActiveLessonMenu(null);
                                    deleteLesson(les.id);
                                    if (selectedLesson === les.id) {
                                      setSelectedLesson(null);
                                    }
                                    setSaved(true);
                                  }}
                                >
                                  <Trash2 size={13} /> Delete Lesson
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Button */}
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 6, marginLeft: 6, color: 'var(--cyan)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={(e) => handleOpenAddLesson(sec.id, e)}
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Module Button */}
            <button
              className="btn btn-secondary"
              style={{ marginTop: 16, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => {
                setNewModuleTitle('');
                setShowAddModuleModal(true);
              }}
            >
              <Plus size={16} /> Add Module
            </button>
          </div>
        </div>

        {/* ── Center Pane: Content Builder ── */}
        <div className={`pane authoring-pane-content ${activeAuthoringTab === 'content' ? 'pane-active-mobile' : ''}`} style={{ borderRight: 'var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
          <div className="pane-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 style={{ fontSize: 15, margin: 0 }}>Lesson Content</h3>
                {/* View Switcher: Block Editor vs Student View */}
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segmented-control-btn ${centerPaneTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setCenterPaneTab('edit')}
                  >
                    <Edit3 size={12} /> Block Editor
                  </button>
                  <button
                    type="button"
                    className={`segmented-control-btn ${centerPaneTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setCenterPaneTab('preview')}
                    title="Live preview how students experience this lesson's content blocks"
                  >
                    <Eye size={12} /> Student View
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {centerPaneTab === 'edit' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                    onClick={() => setShowAddBlockModal(true)}
                    disabled={!selectedLessonData}
                  >
                    <Plus size={13} /> Add Block
                  </button>
                )}
                <button
                  type="button"
                  className={`btn ${isSettingsDrawerOpen ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ fontSize: 11, padding: '4px 11px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setIsSettingsDrawerOpen(prev => !prev)}
                  title={isSettingsDrawerOpen ? "Collapse Lesson Rules Right Drawer" : "Open Lesson Rules Right Drawer"}
                >
                  <Sliders size={13} style={{ color: isSettingsDrawerOpen ? '#ffffff' : 'var(--amber)' }} />
                  <span>Rules Drawer</span>
                  {isSettingsDrawerOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => {
                    const targetId = course?.id || courseId;
                    navigate(`/student/learn/${targetId}?preview=true`);
                  }}
                  title="Open full interactive course player in student preview mode"
                >
                  <ExternalLink size={12} /> Full Player Preview
                </button>
              </div>
            </div>
          </div>

          <div className="pane-body" style={{ flex: 1, overflowY: 'auto' }}>
            {centerPaneTab === 'preview' ? (
              /* Live Student View inside Pane 2 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Eye size={15} style={{ color: 'var(--emerald)' }} />
                    <span style={{ fontSize: 12, color: 'var(--emerald)', fontWeight: 600 }}>
                      Learner Presentation Preview: "{selectedLessonData?.title}"
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCenterPaneTab('edit')}
                    style={{ fontSize: 11, color: 'var(--text-secondary)' }}
                  >
                    Back to Block Editor
                  </button>
                </div>

                {displayedBlocks.length > 0 ? (
                  displayedBlocks.map((blk, idx) => (
                    <div key={blk.id || idx} style={{ position: 'relative' }}>
                      {displayedBlocks.length > 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Block {idx + 1} of {displayedBlocks.length}: {blk.title}
                          </span>
                          <span className={`badge ${blk.req ? 'badge-required' : 'badge-optional'}`} style={{ fontSize: 10 }}>
                            {blk.req ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      )}
                      <ContentBlockPreview block={blk} lessonTitle={selectedLessonData?.title} isCompact={true} />
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 13, marginBottom: 12 }}>No content blocks added to this lesson yet.</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setCenterPaneTab('edit'); setShowAddBlockModal(true); }}>
                      <Plus size={14} /> Add First Content Block
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Block Editor View */
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayedBlocks.map((block) => {
                    const iconInfo = getBlockIcon(block.type);
                    const IconComponent = iconInfo.icon;
                    return (
                      <div className="content-block" key={block.id} style={{ position: 'relative' }}>
                        <GripVertical size={13} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
                        <div className={`content-block-icon ${iconInfo.color}`}>
                          <IconComponent size={16} />
                        </div>
                        <div className="content-block-info" style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <h4 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, fontSize: 13 }}>{block.title}</h4>
                            {block.payloadJson?.fileName && (
                              <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                📄 {block.payloadJson.fileName}
                              </span>
                            )}
                            {block.payloadJson?.mediaUrl && (
                              <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                🎥 {block.payloadJson.duration || 'Video'}
                              </span>
                            )}
                            {block.payloadJson?.questions && block.payloadJson.questions.length > 0 && (
                              <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                ❓ {block.payloadJson.questions.length} questions
                              </span>
                            )}
                            {(block.type === 'presentation' || block.type === 'slides') && (
                              <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)', border: '1px solid rgba(31, 187, 210, 0.3)' }}>
                                📊 Presentation Slides
                              </span>
                            )}
                            {(block.type === 'audio' || block.type === 'podcast') && (
                              <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 4, background: 'rgba(243, 156, 18, 0.15)', color: 'var(--amber)', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
                                🎙️ Audio Lecture
                              </span>
                            )}
                          </div>
                          <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 0', fontSize: 11.5 }}>{block.desc}</p>
                        </div>

                        {/* Block Requirement Badge: compact and consistent */}
                        <span
                          className={`badge ${block.req ? 'badge-required' : 'badge-optional'}`}
                          style={{ flexShrink: 0, fontSize: 9.5, padding: '2px 6px' }}
                          title={block.req ? 'Required block' : 'Optional block'}
                        >
                          {block.req ? 'REQ' : 'OPT'}
                        </span>

                        {/* Quick Preview Block Button */}
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '3px 5px', color: 'var(--cyan)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewBlockModal(block);
                          }}
                          title="Quick preview this block in student mode"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Center 3-Dot Action Menu Button */}
                        <div className="action-dropdown-container" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '3px 5px', color: activeBlockMenu === block.id ? 'var(--cyan)' : 'var(--text-muted)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLessonMenu(null);
                              setActiveBlockMenu(activeBlockMenu === block.id ? null : block.id);
                            }}
                            title="Block Actions"
                          >
                            <MoreVertical size={13} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeBlockMenu === block.id && (
                            <div className="action-dropdown" style={{ right: 0, minWidth: 185 }}>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setActiveBlockMenu(null);
                                  setPreviewBlockModal(block);
                                }}
                              >
                                <Eye size={13} style={{ color: 'var(--cyan)' }} /> Preview as Student
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setActiveBlockMenu(null);
                                  setEditBlockModal({
                                    id: block.id,
                                    type: block.type,
                                    title: block.title,
                                    desc: block.desc,
                                    req: block.req,
                                    payload: block.payloadJson || {
                                      fileName: block.fileName || '',
                                      fileSize: block.fileSize || '',
                                      fileUrl: block.fileUrl || '',
                                      mediaUrl: block.mediaUrl || '',
                                      duration: block.duration || '',
                                      content: block.content || '',
                                      questions: block.questions || [],
                                      checklistItems: block.checklistItems || [],
                                    },
                                  });
                                }}
                              >
                                <Edit3 size={13} style={{ color: 'var(--cyan)' }} /> Edit Details & Content
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setActiveBlockMenu(null);
                                  const nextReq = !block.req;
                                  const inStore = allContentBlocks.some(b => b.id === block.id);
                                  if (inStore) {
                                    updateContentBlock(block.id, { req: nextReq });
                                  } else if (selectedLessonData) {
                                    addContentBlock(selectedLessonData.id, {
                                      type: block.type,
                                      title: block.title,
                                      desc: block.desc,
                                      req: nextReq,
                                    });
                                  }
                                  setSaved(true);
                                }}
                              >
                                <Check size={13} style={{ color: 'var(--emerald)' }} />
                                Make {block.req ? 'Optional' : 'Required'}
                              </button>
                              <button
                                className="action-dropdown-item"
                                onClick={() => {
                                  setActiveBlockMenu(null);
                                  if (selectedLessonData) {
                                    addContentBlock(selectedLessonData.id, {
                                      type: block.type,
                                      title: `${block.title} (Copy)`,
                                      desc: block.desc,
                                      req: block.req,
                                    });
                                  }
                                  setSaved(true);
                                }}
                              >
                                <Copy size={13} style={{ color: 'var(--amber)' }} /> Duplicate
                              </button>
                              <div className="action-dropdown-divider" />
                              <button
                                className="action-dropdown-item danger"
                                onClick={() => {
                                  setActiveBlockMenu(null);
                                  deleteContentBlock(block.id);
                                  setSaved(true);
                                }}
                              >
                                <Trash2 size={13} /> Remove Block
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, marginTop: 12, marginBottom: 4 }}>
                  Drag to reorder • Changes auto-save ⓘ
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Right Pane / Drawer: Lesson Settings & Completion Rules ── */}
        <div
          className={`right-drawer-backdrop ${isSettingsDrawerOpen ? 'open' : ''}`}
          onClick={() => setIsSettingsDrawerOpen(false)}
        />
        <div
          className={`pane authoring-pane-rules right-drawer-panel ${isSettingsDrawerOpen ? 'open' : ''}`}
          aria-hidden={!isSettingsDrawerOpen}
        >
        <div className="right-drawer-header">
          <div>
            <h3 style={{ fontSize: 15, margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Lesson Settings</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {selectedLessonData ? `Rules for "${selectedLessonData.title}"` : 'Configure completion rules'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setIsSettingsDrawerOpen(false)}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="right-drawer-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
              Completion Rules
            </h4>
            <span className={`badge ${isParentRequired ? 'badge-required' : 'badge-optional'}`}>
              {isParentRequired ? 'Required Lesson' : 'Optional Lesson'}
            </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            {isParentRequired
              ? 'Select one or more conditions that must be met to unlock certificate.'
              : 'This lesson is optional. Conditions track learner progress.'}
          </p>

          {/* Viewed */}
          <div className="completion-rule">
            <label className="toggle">
              <input
                type="checkbox"
                checked={completionRules.viewed}
                onChange={e => {
                  setCompletionRules(r => ({ ...r, viewed: e.target.checked }));
                  setSaved(true);
                }}
              />
              <span className="toggle-track" />
            </label>
            <div className="completion-rule-info">
              <h5>Viewed</h5>
              <p>Learner must view the lesson content.</p>
            </div>
          </div>

          {/* Video Percentage */}
          <div className="completion-rule">
            <label className="toggle">
              <input
                type="checkbox"
                checked={completionRules.videoPercentage}
                onChange={e => {
                  setCompletionRules(r => ({ ...r, videoPercentage: e.target.checked }));
                  setSaved(true);
                }}
              />
              <span className="toggle-track" />
            </label>
            <div className="completion-rule-info">
              <h5>Video percentage</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <input
                  type="number"
                  className="input"
                  value={completionRules.videoPercent}
                  onChange={e => {
                    setCompletionRules(r => ({ ...r, videoPercent: parseInt(e.target.value) || 0 }));
                    setSaved(true);
                  }}
                  style={{ width: 60, padding: '4px 8px', fontSize: 13 }}
                  min={0} max={100}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>% watched</span>
              </div>
            </div>
          </div>

          {/* Quiz Passed */}
          <div className="completion-rule">
            <label className="toggle">
              <input
                type="checkbox"
                checked={completionRules.quizPassed}
                onChange={e => {
                  setCompletionRules(r => ({ ...r, quizPassed: e.target.checked }));
                  setSaved(true);
                }}
              />
              <span className="toggle-track" />
            </label>
            <div className="completion-rule-info">
              <h5>Quiz passed</h5>
              <p>Learner must pass the quiz.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <select
                  className="select"
                  value={completionRules.quizThreshold}
                  onChange={e => {
                    setCompletionRules(r => ({ ...r, quizThreshold: parseInt(e.target.value) }));
                    setSaved(true);
                  }}
                  style={{ width: 80, padding: '4px 8px', fontSize: 13 }}
                >
                  <option value={50}>50%</option>
                  <option value={60}>60%</option>
                  <option value={70}>70%</option>
                  <option value={80}>80%</option>
                  <option value={90}>90%</option>
                  <option value={100}>100%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acknowledged */}
          <div className="completion-rule">
            <label className="toggle">
              <input
                type="checkbox"
                checked={completionRules.acknowledged}
                onChange={e => {
                  setCompletionRules(r => ({ ...r, acknowledged: e.target.checked }));
                  setSaved(true);
                }}
              />
              <span className="toggle-track" />
            </label>
            <div className="completion-rule-info">
              <h5>Acknowledged</h5>
              <p>Learner must acknowledge content.</p>
            </div>
          </div>

          {/* Completion Message */}
          <div style={{ marginTop: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              Completion Message <span style={{ color: 'var(--text-muted)' }}>ⓘ</span>
            </h4>
            <textarea
              className="textarea"
              value={completionMsg}
              onChange={e => {
                setCompletionMsg(e.target.value);
                setSaved(true);
              }}
              maxLength={200}
              style={{ minHeight: 70 }}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {completionMsg.length}/200
            </div>
          </div>
        </div>

        <div className="right-drawer-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsSettingsDrawerOpen(false)}
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <X size={14} /> Collapse Inspector
          </button>
        </div>
      </div>
    </div>

      {/* ── SECTION 2 (DIRECTLY BELOW): Course Landing Page, Pricing & Highlights ── */}
      <CourseLandingSection course={course} />

      {/* ── Modal: Add Module ── */}
      {showAddModuleModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModuleModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Module</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModuleModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateModule}>
              <div className="modal-body">
                <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                  Module Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Core Skills or Machine Learning"
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  autoFocus
                  required
                />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Modules organize lessons into logical chapters within the course syllabus.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModuleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Module</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add Lesson ── */}
      {showAddLessonModal && (
        <div className="modal-backdrop" onClick={() => setShowAddLessonModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Lesson</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddLessonModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Hands-On Lab & Setup"
                    value={newLessonTitle}
                    onChange={e => setNewLessonTitle(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {/* ── Custom Non-Blurry Primary Content Type Dropdown ── */}
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Primary Content Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setContentTypeDropdownOpen(prev => !prev);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '11px 14px',
                        background: 'var(--glass-surface-elevated)',
                        border: contentTypeDropdownOpen ? '1px solid var(--cyan)' : 'var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        boxShadow: contentTypeDropdownOpen ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {(() => {
                          const selectedOpt = contentTypeOptions.find(o => o.value === newLessonType) || contentTypeOptions[0];
                          const IconComp = selectedOpt.icon;
                          return (
                            <>
                              <div style={{
                                width: 26, height: 26, borderRadius: 6,
                                background: `${selectedOpt.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: selectedOpt.color
                              }}>
                                <IconComp size={15} />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {selectedOpt.label}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown
                        size={16}
                        style={{
                          color: 'var(--cyan)',
                          transform: contentTypeDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </button>

                    {/* Custom Menu Options */}
                    {contentTypeDropdownOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                          background: 'var(--glass-surface-elevated)',
                          border: '1px solid var(--border-color-active)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-xl)',
                          zIndex: 100,
                          padding: 6,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                          animation: 'fadeInDropdown 0.15s ease-out'
                        }}
                      >
                        {contentTypeOptions.map(opt => {
                          const OptIcon = opt.icon;
                          const isSelected = newLessonType === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setNewLessonType(opt.value);
                                setContentTypeDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '9px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                                border: isSelected ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.12s ease',
                                outline: 'none',
                              }}
                              onMouseEnter={e => {
                                if (!isSelected) e.currentTarget.style.background = 'var(--glass-surface-hover)';
                              }}
                              onMouseLeave={e => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 6,
                                  background: `${opt.color}25`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: opt.color, flexShrink: 0
                                }}>
                                  <OptIcon size={16} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                              </div>
                              {isSelected && <Check size={16} style={{ color: 'var(--cyan)' }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Required for Completion</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Must be passed to unlock certificate</div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={newLessonRequired}
                      onChange={e => setNewLessonRequired(e.target.checked)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>

                {/* ── Content Upload & Authoring Section ── */}
                <div className="modal-inner-card">
                  <ContentUploader
                    type={newLessonType}
                    value={newLessonPayload}
                    onChange={setNewLessonPayload}
                    courseId={courseId}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddLessonModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Lesson</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit / Rename Lesson ── */}
      {editLessonModal && (
        <div className="modal-backdrop" onClick={() => setEditLessonModal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Lesson</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditLessonModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveLessonEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={editLessonModal.title}
                    onChange={e => setEditLessonModal({ ...editLessonModal, title: e.target.value })}
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Required for Course Completion</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Flag this lesson as mandatory or optional</div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={editLessonModal.isRequired}
                      onChange={e => setEditLessonModal({ ...editLessonModal, isRequired: e.target.checked })}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditLessonModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add Content Block ── */}
      {showAddBlockModal && (
        <div className="modal-backdrop" onClick={() => setShowAddBlockModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Content Block</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddBlockModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateContentBlock}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Custom Content Type Dropdown */}
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Block Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddBlockDropdownOpen(prev => !prev);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '11px 14px',
                        background: 'var(--glass-surface-elevated)',
                        border: addBlockDropdownOpen ? '1px solid var(--cyan)' : 'var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        boxShadow: addBlockDropdownOpen ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {(() => {
                          const selectedOpt = contentTypeOptions.find(o => o.value === newBlockType) || contentTypeOptions[0];
                          const IconComp = selectedOpt.icon;
                          return (
                            <>
                              <div style={{
                                width: 26, height: 26, borderRadius: 6,
                                background: `${selectedOpt.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: selectedOpt.color
                              }}>
                                <IconComp size={15} />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {selectedOpt.label}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown
                        size={16}
                        style={{
                          color: 'var(--cyan)',
                          transform: addBlockDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </button>

                    {addBlockDropdownOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                          background: 'var(--glass-surface-elevated)',
                          border: '1px solid var(--border-color-active)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-xl)',
                          zIndex: 100,
                          padding: 6,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                          animation: 'fadeInDropdown 0.15s ease-out'
                        }}
                      >
                        {contentTypeOptions.map(opt => {
                          const OptIcon = opt.icon;
                          const isSelected = newBlockType === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setNewBlockType(opt.value);
                                setAddBlockDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '9px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                                border: isSelected ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.12s ease',
                                outline: 'none',
                              }}
                              onMouseEnter={e => {
                                if (!isSelected) e.currentTarget.style.background = 'var(--glass-surface-hover)';
                              }}
                              onMouseLeave={e => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 6,
                                  background: `${opt.color}25`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: opt.color, flexShrink: 0
                                }}>
                                  <OptIcon size={16} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                              </div>
                              {isSelected && <Check size={16} style={{ color: 'var(--cyan)' }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Block Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Chapter Walkthrough Video"
                    value={newBlockTitle}
                    onChange={e => setNewBlockTitle(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Description / Subtitle
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 15-minute comprehensive video breakdown"
                    value={newBlockDesc}
                    onChange={e => setNewBlockDesc(e.target.value)}
                  />
                </div>

                {/* ── Content Upload & Authoring Section ── */}
                <div className="modal-inner-card">
                  <ContentUploader
                    type={newBlockType}
                    value={newBlockPayload}
                    onChange={setNewBlockPayload}
                    courseId={courseId}
                    lessonId={selectedLessonData?.id}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddBlockModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Block</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Content Block ── */}
      {editBlockModal && (
        <div className="modal-backdrop" onClick={() => setEditBlockModal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Content Block</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditBlockModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBlockEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Block Title
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={editBlockModal.title}
                    onChange={e => setEditBlockModal({ ...editBlockModal, title: e.target.value })}
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Description
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={editBlockModal.desc}
                    onChange={e => setEditBlockModal({ ...editBlockModal, desc: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Required Block</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Learner must interact with this block to proceed</div>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={editBlockModal.req}
                      onChange={e => setEditBlockModal({ ...editBlockModal, req: e.target.checked })}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>

                {/* ── Content Upload & Authoring Section ── */}
                <div className="modal-inner-card">
                  <ContentUploader
                    type={editBlockModal.type || 'text'}
                    value={editBlockModal.payload || {}}
                    onChange={p => setEditBlockModal(prev => ({ ...prev, payload: p }))}
                    courseId={courseId}
                    lessonId={selectedLessonData?.id}
                    blockId={editBlockModal.id}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditBlockModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Course Preview Center Modal ── */}
      {showPreviewChoiceModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewChoiceModal(false)}>
          <div className="modal" style={{ maxWidth: 580, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 'var(--border-subtle)', padding: '16px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Eye size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-primary)' }}>Course Preview Center</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Choose how you would like to preview "{course.title}"</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPreviewChoiceModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Option 1: Student Player Preview (Primary Recommended) */}
              <div
                style={{
                  padding: 18,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08))',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
                      color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>
                          Student Course Player Preview
                        </h4>
                        <span className="badge badge-active" style={{ fontSize: 10 }}>Recommended</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Experience the complete student learning portal. All modules, lessons, video players, quizzes, and task checklists are unlocked without needing enrollment or payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setShowPreviewChoiceModal(false);
                      window.open(`/student/learn/${course.id}?preview=true`, '_blank');
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <ExternalLink size={13} /> Open in New Tab
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setShowPreviewChoiceModal(false);
                      navigate(`/student/learn/${course.id}?preview=true`);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Play size={13} /> Launch Player Preview
                  </button>
                </div>
              </div>

              {/* Option 2: Course Landing & Catalog Page */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
                      Public Landing & Catalog Page
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      View the public sales page with pricing ({course.price === 0 ? 'Free' : `$${course.price}`}), perks, thumbnail, and curriculum outline.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowPreviewChoiceModal(false);
                    navigate(`/course/${course.slug}`);
                  }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  View Landing
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: 'var(--border-subtle)', padding: '12px 22px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPreviewChoiceModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Block Preview Modal ── */}
      {previewBlockModal && (
        <div className="modal-overlay" onClick={() => setPreviewBlockModal(null)}>
          <div className="modal" style={{ maxWidth: 760, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 'var(--border-subtle)', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Eye size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>
                      Student Block Preview: {previewBlockModal.title}
                    </h3>
                    <span className="badge badge-active" style={{ fontSize: 10, textTransform: 'capitalize' }}>
                      {previewBlockModal.type || 'Block'}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    Live interactive learner preview. Test options, controls, and responses.
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreviewBlockModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
              <ContentBlockPreview
                block={previewBlockModal}
                lessonTitle={selectedLessonData?.title}
                isCompact={false}
              />
            </div>

            <div className="modal-footer" style={{ borderTop: 'var(--border-subtle)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const b = previewBlockModal;
                  setPreviewBlockModal(null);
                  setEditBlockModal({
                    id: b.id,
                    type: b.type,
                    title: b.title,
                    desc: b.desc,
                    req: b.req,
                    payload: b.payloadJson || {
                      fileName: b.fileName || '',
                      fileSize: b.fileSize || '',
                      fileUrl: b.fileUrl || '',
                      mediaUrl: b.mediaUrl || '',
                      duration: b.duration || '',
                      content: b.content || '',
                      questions: b.questions || [],
                      checklistItems: b.checklistItems || [],
                    },
                  });
                }}
              >
                <Edit3 size={13} style={{ marginRight: 4 }} /> Edit Block Content
              </button>

              <button type="button" className="btn btn-primary btn-sm" onClick={() => setPreviewBlockModal(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Sticky Floating Right Drawer Handle (<) ── */}
      <button
        type="button"
        className={`authoring-right-tab-trigger ${isSettingsDrawerOpen ? 'is-open' : ''}`}
        onClick={() => setIsSettingsDrawerOpen(prev => !prev)}
        title={isSettingsDrawerOpen ? "Close Lesson Rules Drawer" : "Open Lesson Rules & Completion Settings Drawer"}
        aria-label={isSettingsDrawerOpen ? "Close Lesson Rules Drawer" : "Open Lesson Rules Drawer"}
      >
        {isSettingsDrawerOpen ? (
          <ChevronRight size={18} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>
    </div>
  );
}
