import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ContentBlockPreview from '../../components/ContentBlockPreview';
import ThemeToggle from '../../components/ThemeToggle';
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Lock,
  Play, Download, X, Award, Clock, Monitor, RefreshCw,
  ArrowLeft, Smartphone, Tablet, Laptop, FileText
} from 'lucide-react';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewParam = searchParams.get('preview') === 'true';

  const {
    courses, currentUser, getSectionsForCourse, getLessonsForSection,
    getEnrollment, getProgressForEnrollment, getLessonProgress,
    calculateCourseProgress, isCourseFullyCompleted, getCourseCompletionDetails,
    completeLesson, checkAndCompleteCourse,
    updateLessonProgress, contentBlocks, sections: allRawSections, courseVersions,
    getAssignmentsForCourse
  } = useLms();

  const course = courses.find(c => c.id === courseId);
  const enrollment = getEnrollment(courseId, currentUser?.id);

  // If preview=true or user has no enrollment (or is viewing author draft), enable preview mode
  const isPreview = isPreviewParam || !enrollment;

  // Resolve sections for the course
  const standardSections = getSectionsForCourse(courseId);
  const sections = standardSections.length > 0
    ? standardSections
    : (allRawSections || []).filter(s => {
        const cVersions = (courseVersions || []).filter(v => v.courseId === courseId);
        return cVersions.some(v => v.id === s.courseVersionId) || s.courseVersionId === course?.publishedVersionId;
      }).sort((a, b) => a.sortOrder - b.sortOrder);

  // Viewport mode: desktop, tablet, mobile
  const [deviceViewport, setDeviceViewport] = useState('desktop');
  const [previewCompletedLessons, setPreviewCompletedLessons] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(sections.map(s => s.id)));
  const [activeLesson, setActiveLesson] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const courseAssignments = (typeof getAssignmentsForCourse === 'function' ? getAssignmentsForCourse(courseId) : []) || [];

  // Update expanded sections when sections change
  useEffect(() => {
    if (sections.length > 0) {
      setExpandedSections(new Set(sections.map(s => s.id)));
    }
  }, [sections.length]);

  // Find first lesson or first incomplete lesson
  useEffect(() => {
    if (sections.length === 0) return;

    if (!isPreview && enrollment) {
      for (const section of sections) {
        const lessons = getLessonsForSection(section.id);
        for (const lesson of lessons) {
          const prog = getLessonProgress(enrollment.id, lesson.id);
          if (!prog || prog.status !== 'Completed') {
            setActiveLesson(lesson.id);
            return;
          }
        }
      }
    }

    // Default to first lesson of first section
    const firstSectionLessons = getLessonsForSection(sections[0].id);
    if (firstSectionLessons.length > 0) {
      setActiveLesson(firstSectionLessons[0].id);
    }
  }, [sections.length, courseId, isPreview]);

  const toggleSection = (id) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getActiveLessonData = () => {
    for (const section of sections) {
      const lessons = getLessonsForSection(section.id);
      const found = lessons.find(l => l.id === activeLesson);
      if (found) return found;
    }
    return null;
  };

  const getNextLesson = () => {
    let foundCurrent = false;
    for (const section of sections) {
      const lessons = getLessonsForSection(section.id);
      for (const lesson of lessons) {
        if (foundCurrent) return lesson;
        if (lesson.id === activeLesson) foundCurrent = true;
      }
    }
    return null;
  };

  const getLessonStatus = (lessonId) => {
    if (isPreview) {
      if (previewCompletedLessons.has(lessonId)) return 'completed';
      return 'available';
    }
    if (!enrollment) return 'locked';
    const prog = getLessonProgress(enrollment.id, lessonId);
    if (prog?.status === 'Completed') return 'completed';
    if (prog?.status === 'In_Progress') return 'in_progress';

    // Check if previous required lessons are done
    let canAccess = true;
    for (const section of sections) {
      const lessons = getLessonsForSection(section.id);
      for (const lesson of lessons) {
        if (lesson.id === lessonId) return canAccess ? 'available' : 'locked';
        if (lesson.isRequired) {
          const p = getLessonProgress(enrollment.id, lesson.id);
          if (!p || p.status !== 'Completed') canAccess = false;
        }
      }
    }
    return 'locked';
  };

  const activeLessonData = getActiveLessonData();
  const nextLesson = getNextLesson();

  const allCourseLessons = sections.flatMap(s => getLessonsForSection(s.id));
  const completedLessonsCount = isPreview
    ? previewCompletedLessons.size
    : allCourseLessons.filter(l => getLessonProgress(enrollment?.id, l.id)?.status === 'Completed').length;
  
  const isCourseEligibleForCertificate = isPreview
    ? (allCourseLessons.length > 0 && previewCompletedLessons.size >= allCourseLessons.length)
    : isCourseFullyCompleted(courseId, currentUser?.id);

  const handleMarkComplete = (targetLessonId = activeLesson) => {
    if (!targetLessonId) return;

    if (isPreview) {
      const nextCompleted = new Set([...previewCompletedLessons, targetLessonId]);
      setPreviewCompletedLessons(nextCompleted);

      // Check if all lessons across all modules are complete
      const allLessons = sections.flatMap(s => getLessonsForSection(s.id));
      if (allLessons.length > 0 && nextCompleted.size >= allLessons.length) {
        setShowCertModal(true);
      } else if (nextLesson) {
        setActiveLesson(nextLesson.id);
      }
      return;
    }

    if (!enrollment) return;
    completeLesson(enrollment.id, targetLessonId);
    // Strict logic: checkAndCompleteCourse verifies that ALL modules and ALL lessons are completed
    const completed = checkAndCompleteCourse(courseId, currentUser?.id);
    if (completed) {
      setShowCertModal(true);
    } else if (nextLesson) {
      setActiveLesson(nextLesson.id);
    }
  };

  const calculateEffectiveProgress = () => {
    if (isPreview) {
      const allLessons = sections.flatMap(s => getLessonsForSection(s.id));
      if (!allLessons.length) return 0;
      if (previewCompletedLessons.size >= allLessons.length) return 100;
      const pct = Math.floor((previewCompletedLessons.size / allLessons.length) * 100);
      return pct >= 100 && previewCompletedLessons.size < allLessons.length ? 99 : pct;
    }
    return calculateCourseProgress(courseId, currentUser?.id);
  };

  const courseProgress = calculateEffectiveProgress();

  const getSectionProgress = (sectionId) => {
    const lessons = getLessonsForSection(sectionId);
    if (isPreview) {
      const completed = lessons.filter(l => previewCompletedLessons.has(l.id)).length;
      return `${completed} / ${lessons.length} Lessons`;
    }
    const completed = lessons.filter(l => {
      const p = getLessonProgress(enrollment?.id, l.id);
      return p?.status === 'Completed';
    }).length;
    return `${completed} / ${lessons.length} Lessons`;
  };

  if (!course) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>Course not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>The requested course ID could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/courses')}>
          Return to Courses
        </button>
      </div>
    );
  }

  // Active lesson blocks
  const activeLessonBlocks = (contentBlocks || []).filter(b => b.lessonId === activeLesson);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-gradient)', overflow: 'hidden' }}>
      {/* ── Student Preview Mode Floating Banner ── */}
      {isPreview && (
        <div style={{
          background: 'linear-gradient(90deg, #0284c7 0%, #0d9488 50%, #059669 100%)',
          color: '#ffffff',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 100,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: 'rgba(0, 0, 0, 0.25)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              border: '1px solid rgba(255, 255, 255, 0.35)'
            }}>
              Student Preview Mode
            </span>
            <span>You are viewing this course exactly as enrolled learners experience it. All modules and lessons are unlocked.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Viewport Device Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 6,
              padding: 2,
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDeviceViewport('desktop')}
                style={{
                  padding: '3px 8px',
                  fontSize: 11,
                  color: deviceViewport === 'desktop' ? '#0f172a' : '#ffffff',
                  background: deviceViewport === 'desktop' ? '#ffffff' : 'transparent',
                  fontWeight: deviceViewport === 'desktop' ? 800 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Desktop View (Full Width)"
              >
                <Laptop size={12} /> Desktop
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDeviceViewport('tablet')}
                style={{
                  padding: '3px 8px',
                  fontSize: 11,
                  color: deviceViewport === 'tablet' ? '#0f172a' : '#ffffff',
                  background: deviceViewport === 'tablet' ? '#ffffff' : 'transparent',
                  fontWeight: deviceViewport === 'tablet' ? 800 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Tablet View (768px)"
              >
                <Tablet size={12} /> Tablet
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDeviceViewport('mobile')}
                style={{
                  padding: '3px 8px',
                  fontSize: 11,
                  color: deviceViewport === 'mobile' ? '#0f172a' : '#ffffff',
                  background: deviceViewport === 'mobile' ? '#ffffff' : 'transparent',
                  fontWeight: deviceViewport === 'mobile' ? 800 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Mobile View (390px)"
              >
                <Smartphone size={12} /> Mobile
              </button>
            </div>

            {/* Reset Test Progress */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setPreviewCompletedLessons(new Set());
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
              title="Reset simulated test progress and quizzes"
            >
              <RefreshCw size={12} /> Reset Progress
            </button>

            {/* Exit Preview */}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => navigate(`/admin/courses/${courseId}/author`)}
              style={{
                background: '#ffffff',
                color: '#0f172a',
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                padding: '4px 12px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <ArrowLeft size={13} /> Exit Preview & Return to Editor
            </button>
          </div>
        </div>
      )}

      {/* ── Viewport Frame Container ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: deviceViewport === 'mobile' ? 390 : deviceViewport === 'tablet' ? 768 : '100%',
        margin: '0 auto',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: deviceViewport !== 'desktop' ? '0 0 50px rgba(0,0,0,0.8)' : 'none',
        borderLeft: deviceViewport !== 'desktop' ? '1px solid rgba(255,255,255,0.1)' : 'none',
        borderRight: deviceViewport !== 'desktop' ? '1px solid rgba(255,255,255,0.1)' : 'none',
        overflow: 'hidden'
      }}>
        {/* Top Navigation Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 52, borderBottom: 'var(--border-subtle)',
          background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => isPreview ? navigate(`/admin/courses/${courseId}/author`) : navigate('/student')}
              title={isPreview ? 'Back to Authoring' : 'Back to Dashboard'}
            >
              <X size={18} />
            </button>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Training LMS</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.title}</div>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 440, margin: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Course Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{courseProgress}% Complete</span>
            </div>
            <div className="progress-bar progress-bar-emerald" style={{ height: 7, borderRadius: 4 }}>
              <div className="progress-bar-fill" style={{ width: `${courseProgress}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle size="sm" />
            {isPreview ? (
              <span className="badge badge-active" style={{ fontSize: 11, background: 'rgba(6,182,212,0.2)', color: 'var(--cyan)' }}>
                Learner View
              </span>
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 11, fontWeight: 700
              }}>
                {(currentUser?.name || 'Ava').split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
        </div>

        {/* 3-Pane Course Player Layout */}
        <div className="three-pane" style={{ flex: 1, overflow: 'hidden' }}>
          {/* Left: Syllabus (Modules & Lessons) */}
          <div className="pane" style={{ width: deviceViewport === 'mobile' ? 220 : 280, flexShrink: 0 }}>
            <div className="pane-header" style={{ padding: '12px 14px' }}>
              <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
                Modules & Lessons
              </h3>
            </div>
            <div className="pane-body" style={{ padding: 8 }}>
              {sections.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No modules defined yet. Add modules in the authoring studio.
                </div>
              ) : (
                sections.map((sec, secIdx) => {
                  const secLessons = getLessonsForSection(sec.id);
                  const isExpanded = expandedSections.has(sec.id);
                  const completedCount = isPreview
                    ? secLessons.filter(l => previewCompletedLessons.has(l.id)).length
                    : secLessons.filter(l => getLessonProgress(enrollment?.id, l.id)?.status === 'Completed').length;
                  const allDone = secLessons.length > 0 && completedCount === secLessons.length;

                  return (
                    <div key={sec.id} style={{ marginBottom: 6 }}>
                      <div
                        className="accordion-header"
                        onClick={() => toggleSection(sec.id)}
                        style={{ padding: '8px 10px', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 16 }}>{secIdx + 1}</span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sec.title}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: allDone ? 'var(--emerald)' : 'var(--text-muted)', flexShrink: 0 }}>
                          {getSectionProgress(sec.id)}
                        </span>
                      </div>
                      {isExpanded && (
                        <div style={{ paddingLeft: 12, marginTop: 2 }}>
                          {secLessons.map((les, lesIdx) => {
                            const status = getLessonStatus(les.id);
                            const isActive = les.id === activeLesson;

                            return (
                              <div
                                key={les.id}
                                className={`lesson-item ${isActive ? 'active' : ''} ${status}`}
                                onClick={() => {
                                  if (status !== 'locked' || isPreview) {
                                    setActiveLesson(les.id);
                                  }
                                }}
                                style={{ padding: '7px 10px', cursor: 'pointer' }}
                              >
                                <span className="lesson-status-icon">
                                  {status === 'completed' ? <CheckCircle2 size={15} style={{ color: 'var(--emerald)' }} /> :
                                   status === 'in_progress' ? <Circle size={15} style={{ color: 'var(--cyan)' }} /> :
                                   status === 'locked' && !isPreview ? <Lock size={13} style={{ color: 'var(--text-muted)' }} /> :
                                   <Circle size={15} style={{ color: 'var(--text-muted)' }} />}
                                </span>
                                <span className="lesson-title" style={{ fontSize: 12 }}>
                                  {secIdx + 1}.{lesIdx + 1} {les.title}
                                </span>
                                {status === 'completed' && <span className="lesson-label" style={{ color: 'var(--emerald)' }}>Done</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Course Assignments & Projects */}
              {courseAssignments.length > 0 && (
                <div style={{
                  margin: '16px 4px 8px', padding: 12, background: 'var(--glass-surface)',
                  border: '1px solid rgba(31, 187, 210, 0.3)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={18} style={{ color: 'var(--cyan)' }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Assignments & Projects</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {courseAssignments.length} practical task{courseAssignments.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAssignmentsModal(true)}
                    style={{ width: '100%', fontSize: 11, justifyContent: 'center', padding: '6px 10px' }}
                  >
                    <FileText size={12} /> View & Submit Tasks
                  </button>
                </div>
              )}

              {/* Certificate Card Preview & Strict Lock Status */}
              <div style={{
                margin: '16px 4px 8px', padding: 14, background: 'var(--glass-surface)',
                border: isCourseEligibleForCertificate ? '1px solid rgba(243, 156, 18, 0.4)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={20} style={{ color: isCourseEligibleForCertificate ? 'var(--amber)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Certificate of Completion</div>
                    <div style={{ fontSize: 11, color: isCourseEligibleForCertificate ? 'var(--emerald)' : 'var(--text-muted)' }}>
                      {isCourseEligibleForCertificate
                        ? '🎉 Unlocked! Ready to claim'
                        : `🔒 Locked (${completedLessonsCount}/${allCourseLessons.length} lessons completed)`}
                    </div>
                  </div>
                </div>

                {isCourseEligibleForCertificate ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCertModal(true)}
                    style={{ marginTop: 10, width: '100%', fontSize: 11, justifyContent: 'center', background: 'var(--amber)', borderColor: 'var(--amber)', color: '#000', fontWeight: 700 }}
                  >
                    <Award size={13} /> View & Claim Certificate
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowCertModal(true)}
                    style={{
                      marginTop: 10, width: '100%', padding: '8px 10px',
                      background: 'rgba(243, 156, 18, 0.08)', border: '1px solid rgba(243, 156, 18, 0.25)',
                      borderRadius: 6, fontSize: 11, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 6,
                      justifyContent: 'flex-start', textAlign: 'left', lineHeight: 1.4
                    }}
                    title="Click to check completion requirements"
                  >
                    <Lock size={12} style={{ flexShrink: 0 }} />
                    <span>Complete all {allCourseLessons.length} lessons in all {sections.length} modules to unlock certificate.</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center: Content Body */}
          <div className="pane" style={{ borderRight: 'var(--border-subtle)', flex: 1, overflowY: 'auto' }}>
            <div className="pane-body" style={{ padding: deviceViewport === 'mobile' ? 14 : 24 }}>
              {/* Content Blocks for Active Lesson */}
              {activeLessonBlocks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {activeLessonBlocks.map((blk, blkIdx) => (
                    <div key={blk.id || blkIdx} style={{ position: 'relative' }}>
                      {activeLessonBlocks.length > 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                            Block {blkIdx + 1} of {activeLessonBlocks.length}: {blk.title}
                          </span>
                          <span className={`badge ${blk.req ? 'badge-required' : 'badge-optional'}`} style={{ fontSize: 10 }}>
                            {blk.req ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      )}
                      <ContentBlockPreview
                        block={blk}
                        lessonTitle={activeLessonData?.title}
                        onComplete={() => handleMarkComplete()}
                        isCompact={deviceViewport === 'mobile'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback if lesson has no dedicated blocks */
                <ContentBlockPreview
                  block={{
                    id: `default-${activeLesson}`,
                    type: activeLessonData?.type || 'video',
                    title: activeLessonData?.title || 'Lesson Overview',
                    desc: 'Welcome to this lesson. Complete the lesson content below.',
                    payloadJson: {
                      title: activeLessonData?.title || 'Lesson Overview',
                      duration: activeLessonData?.durationMinutes ? `${activeLessonData.durationMinutes}:00` : '15:00',
                    }
                  }}
                  lessonTitle={activeLessonData?.title}
                  onComplete={() => handleMarkComplete()}
                  isCompact={deviceViewport === 'mobile'}
                />
              )}

              {/* Lesson Footer Details */}
              {activeLessonData && (
                <div style={{ marginTop: 24, paddingTop: 18, borderTop: 'var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
                    <h2 style={{ fontSize: 18, margin: 0, color: 'var(--text-primary)' }}>
                      Lesson: {activeLessonData.title}
                    </h2>
                    <span className="badge badge-active">
                      {getLessonStatus(activeLessonData.id) === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, marginBottom: 16, lineHeight: 1.5 }}>
                    Comprehensive course modules designed to build skills, evaluate knowledge, and prepare learners for certification.
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Play size={14} /> Video & Content</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {activeLessonData.duration || `${activeLessonData.durationMinutes || 15} mins`}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Monitor size={14} /> Interactive Learner View</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleMarkComplete()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <CheckCircle2 size={16} /> Mark Lesson as Complete
                    </button>
                    {nextLesson && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setActiveLesson(nextLesson.id)}
                      >
                        Next Lesson →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Next Up & Overview */}
          {deviceViewport === 'desktop' && (
            <div className="pane" style={{ width: 280, flexShrink: 0 }}>
              <div className="pane-body" style={{ padding: 16 }}>
                {nextLesson && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10 }}>
                      Next Lesson
                    </h4>
                    <div
                      style={{
                        background: 'var(--glass-surface)', border: 'var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer'
                      }}
                      onClick={() => setActiveLesson(nextLesson.id)}
                    >
                      <div style={{
                        height: 70, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(20, 184, 166, 0.1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Play size={22} style={{ color: 'var(--cyan)' }} />
                      </div>
                      <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{nextLesson.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{nextLesson.duration || '12 mins'}</div>
                      </div>
                    </div>
                  </div>
                )}

                <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10 }}>
                  Curriculum Progress
                </h4>
                {sections.map(sec => {
                  const secLessons = getLessonsForSection(sec.id);
                  return secLessons.map(les => {
                    const status = getLessonStatus(les.id);
                    return (
                      <div
                        key={les.id}
                        onClick={() => setActiveLesson(les.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 4px',
                          fontSize: 12, cursor: 'pointer'
                        }}
                      >
                        {status === 'completed' ? <CheckCircle2 size={14} style={{ color: 'var(--emerald)' }} /> :
                         <Circle size={14} style={{ color: 'var(--text-muted)' }} />}
                        <span style={{ color: les.id === activeLesson ? 'var(--cyan)' : 'var(--text-primary)', fontWeight: les.id === activeLesson ? 700 : 500, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {les.title}
                        </span>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Celebration / Strict Lock Modal */}
      {showCertModal && (
        <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            {!isCourseEligibleForCertificate ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', background: 'rgba(243, 156, 18, 0.15)',
                  color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: '1px solid rgba(243, 156, 18, 0.3)'
                }}>
                  <Lock size={30} />
                </div>
                <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>Certificate Locked</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                  You cannot receive a certificate until you complete <strong>all modules and lessons</strong> in this course.
                </p>

                <div style={{
                  padding: '10px 14px', borderRadius: 8, background: 'rgba(23, 40, 59, 0.4)',
                  border: 'var(--border-subtle)', marginBottom: 16, textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    <span>Completion Progress</span>
                    <span style={{ color: 'var(--amber)' }}>{completedLessonsCount} / {allCourseLessons.length} Lessons</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
                    <div className="progress-bar-fill" style={{ width: `${courseProgress}%`, background: 'var(--amber)' }} />
                  </div>
                </div>

                <div style={{ maxHeight: 160, overflowY: 'auto', textAlign: 'left', marginBottom: 20, background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: 8, border: 'var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 4 }}>
                    Modules Status:
                  </div>
                  {sections.map(sec => {
                    const secLessons = getLessonsForSection(sec.id);
                    const doneCount = isPreview
                      ? secLessons.filter(l => previewCompletedLessons.has(l.id)).length
                      : secLessons.filter(l => getLessonProgress(enrollment?.id, l.id)?.status === 'Completed').length;
                    const isSecDone = secLessons.length > 0 && doneCount === secLessons.length;
                    return (
                      <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: isSecDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isSecDone ? 'line-through' : 'none', flex: 1, paddingRight: 8 }}>
                          {sec.title}
                        </span>
                        <span style={{ fontSize: 11, color: isSecDone ? 'var(--emerald)' : 'var(--amber)', fontWeight: 600, flexShrink: 0 }}>
                          {isSecDone ? '✓ Completed' : `${doneCount}/${secLessons.length} done`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const firstInc = allCourseLessons.find(les => {
                        if (isPreview) return !previewCompletedLessons.has(les.id);
                        const prog = getLessonProgress(enrollment?.id, les.id);
                        return !prog || prog.status !== 'Completed';
                      });
                      if (firstInc) setActiveLesson(firstInc.id);
                      setShowCertModal(false);
                    }}
                  >
                    Resume Incomplete Lessons
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCertModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="celebration-modal" style={{ padding: 24, textAlign: 'center' }}>
                <div className="celebration-icon" style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(243, 156, 18, 0.2)',
                  color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: '1px solid rgba(243, 156, 18, 0.4)'
                }}>
                  <Award size={36} />
                </div>
                <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>🎉 Congratulations!</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  You have successfully completed <strong>every module and lesson</strong> in {course.title} and earned your official verified certificate!
                </p>

                <div className="certificate-preview" style={{
                  padding: 20, background: 'var(--glass-surface-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', marginBottom: 20, textAlign: 'center'
                }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--cyan)', fontWeight: 700 }}>
                    Certificate of Completion
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, margin: '8px 0', color: 'var(--text-primary)' }}>
                    {currentUser?.name || 'Ava Thompson'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{course.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • 100% Curriculum Completed
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setShowCertModal(false)}>
                    Close Preview
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCertModal(false);
                      navigate('/student/certificates');
                    }}
                  >
                    View in My Certificates
                  </button>
                  {isPreview && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setShowCertModal(false);
                        navigate(`/admin/courses/${courseId}/author`);
                      }}
                    >
                      Back to Authoring
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Assignments & Tasks Modal */}
      {showAssignmentsModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignmentsModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} className="text-cyan" />
                <h3 style={{ margin: 0 }}>Course Assignments & Tasks</h3>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowAssignmentsModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
              {courseAssignments.length > 0 ? (
                courseAssignments.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: 12,
                      background: 'var(--glass-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</span>
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', fontSize: 10 }}>
                        {a.totalPoints || 100} pts
                      </span>
                    </div>
                    {a.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{a.description}</p>
                    )}
                    {a.dueDate && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Clock size={11} /> Due: {new Date(a.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  No assignments posted for this course yet.
                </p>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowAssignmentsModal(false);
                  navigate('/student/assignments');
                }}
              >
                Go to Assignments Hub
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAssignmentsModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
