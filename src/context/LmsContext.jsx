import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  USERS, COURSES, COURSE_VERSIONS, SECTIONS, LESSONS,
  CONTENT_BLOCKS, ENROLLMENTS, PROGRESS, CERTIFICATES,
  PAYMENTS, SYSTEM_HEALTH, NOTIFICATIONS, DASHBOARD_METRICS,
  REVIEWS, ASSIGNMENTS, SUBMISSIONS, COUPONS, INVOICES,
  DISCUSSIONS, DISCUSSION_REPLIES, WEBHOOK_LOGS, MEDIA_ASSETS
} from '../data/mockData';

const LmsContext = createContext(null);

const STORAGE_KEY = 'evergreen_lms_state';

function getInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.courses)) {
        parsed.courses = parsed.courses.map(c => {
          const defaultCourse = COURSES.find(dc => dc.id === c.id);
          return {
            ...c,
            thumbnailUrl: c.thumbnailUrl || defaultCourse?.thumbnailUrl || `/thumbnails/${c.slug}.jpg`,
          };
        });
      }
      if (parsed && Array.isArray(parsed.enrollments)) {
        const hasAdminEnrollment = parsed.enrollments.some(e => e.userId === 'user-admin-1');
        if (!hasAdminEnrollment) {
          const adminEnrs = ENROLLMENTS.filter(e => e.userId === 'user-admin-1');
          parsed.enrollments = [...parsed.enrollments, ...adminEnrs];
          const adminProgs = PROGRESS.filter(p => p.id.startsWith('prog-adm'));
          parsed.progress = [...(parsed.progress || []), ...adminProgs];
          const adminCerts = CERTIFICATES.filter(c => c.id.startsWith('cert-admin'));
          parsed.certificates = [...(parsed.certificates || []), ...adminCerts];
        }
      }

      if (parsed) {
        // Merge missing users
        if (Array.isArray(parsed.users)) {
          USERS.forEach(u => {
            if (!parsed.users.some(pu => pu.id === u.id)) {
              parsed.users.push(u);
            }
          });
        }
        // Merge missing enrollments
        if (Array.isArray(parsed.enrollments)) {
          ENROLLMENTS.forEach(e => {
            if (!parsed.enrollments.some(pe => pe.id === e.id)) {
              parsed.enrollments.push(e);
            }
          });
        }
        // Merge missing payments (including Pending and Refunded)
        if (Array.isArray(parsed.payments)) {
          PAYMENTS.forEach(p => {
            if (!parsed.payments.some(pp => pp.id === p.id)) {
              parsed.payments.push(p);
            }
          });
        }
        // Ensure courseVersions have string versionNumbers
        if (Array.isArray(parsed.courseVersions)) {
          parsed.courseVersions = parsed.courseVersions.map(v => ({
            ...v,
            versionNumber: typeof v.versionNumber === 'number' ? `${v.versionNumber}.0.0` : String(v.versionNumber || '1.0.0')
          }));
        }
        // Merge missing sections
        if (Array.isArray(parsed.sections)) {
          SECTIONS.forEach(s => {
            if (!parsed.sections.some(ps => ps.id === s.id)) {
              parsed.sections.push(s);
            }
          });
        }
        // Merge missing lessons
        if (Array.isArray(parsed.lessons)) {
          LESSONS.forEach(l => {
            if (!parsed.lessons.some(pl => pl.id === l.id)) {
              parsed.lessons.push(l);
            }
          });
        }
        // Merge missing content blocks
        if (Array.isArray(parsed.contentBlocks)) {
          CONTENT_BLOCKS.forEach(cb => {
            if (!parsed.contentBlocks.some(pcb => pcb.id === cb.id)) {
              parsed.contentBlocks.push(cb);
            }
          });
        }
        // Merge missing progress
        if (Array.isArray(parsed.progress)) {
          PROGRESS.forEach(p => {
            if (!parsed.progress.some(pp => pp.id === p.id)) {
              parsed.progress.push(p);
            }
          });
        }
        // Populate new collections if missing or empty
        if (!Array.isArray(parsed.reviews) || parsed.reviews.length === 0) {
          parsed.reviews = REVIEWS;
        }
        if (!Array.isArray(parsed.assignments) || parsed.assignments.length === 0) {
          parsed.assignments = ASSIGNMENTS;
        }
        if (!Array.isArray(parsed.submissions) || parsed.submissions.length === 0) {
          parsed.submissions = SUBMISSIONS;
        }
        if (!Array.isArray(parsed.coupons) || parsed.coupons.length === 0) {
          parsed.coupons = COUPONS;
        }
        if (!Array.isArray(parsed.invoices) || parsed.invoices.length === 0) {
          parsed.invoices = INVOICES;
        }
        if (!Array.isArray(parsed.discussions) || parsed.discussions.length === 0) {
          parsed.discussions = DISCUSSIONS;
        }
        if (!Array.isArray(parsed.discussionReplies) || parsed.discussionReplies.length === 0) {
          parsed.discussionReplies = DISCUSSION_REPLIES;
        }
        if (!Array.isArray(parsed.webhookLogs) || parsed.webhookLogs.length === 0) {
          parsed.webhookLogs = WEBHOOK_LOGS;
        }
        if (!Array.isArray(parsed.mediaAssets) || parsed.mediaAssets.length === 0) {
          parsed.mediaAssets = MEDIA_ASSETS;
        }
      }
      return parsed;
    }
  } catch (e) { /* ignore */ }

  return {
    users: USERS,
    courses: COURSES,
    courseVersions: COURSE_VERSIONS,
    sections: SECTIONS,
    lessons: LESSONS,
    contentBlocks: CONTENT_BLOCKS,
    enrollments: ENROLLMENTS,
    progress: PROGRESS,
    certificates: CERTIFICATES,
    payments: PAYMENTS,
    reviews: REVIEWS,
    assignments: ASSIGNMENTS,
    submissions: SUBMISSIONS,
    coupons: COUPONS,
    invoices: INVOICES,
    discussions: DISCUSSIONS,
    discussionReplies: DISCUSSION_REPLIES,
    webhookLogs: WEBHOOK_LOGS,
    mediaAssets: MEDIA_ASSETS,
    systemHealth: SYSTEM_HEALTH,
    notifications: NOTIFICATIONS,
    dashboardMetrics: DASHBOARD_METRICS,
    currentUserId: 'user-admin-1',
  };
}

const THEME_STORAGE_KEY = 'evergreen_lms_theme';

export function LmsProvider({ children }) {
  const [state, setState] = useState(getInitialState);
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch { /* ignore */ }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }, [state]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) || state.users[0];

  const switchUser = useCallback((userId) => {
    setState(s => ({ ...s, currentUserId: userId }));
  }, []);

  const updateUser = useCallback((userId, updates) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === userId ? { ...u, ...updates } : u),
    }));
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      users: USERS,
      courses: COURSES,
      courseVersions: COURSE_VERSIONS,
      sections: SECTIONS,
      lessons: LESSONS,
      contentBlocks: CONTENT_BLOCKS,
      enrollments: ENROLLMENTS,
      progress: PROGRESS,
      certificates: CERTIFICATES,
      payments: PAYMENTS,
      reviews: REVIEWS,
      assignments: ASSIGNMENTS,
      submissions: SUBMISSIONS,
      coupons: COUPONS,
      invoices: INVOICES,
      systemHealth: SYSTEM_HEALTH,
      notifications: NOTIFICATIONS,
      dashboardMetrics: DASHBOARD_METRICS,
      currentUserId: 'user-admin-1',
    });
  }, []);

  // ── Progress Engine ──
  const getSectionsForCourse = useCallback((courseId) => {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return [];
    const versionId = course.publishedVersionId;
    const courseVersionIds = (state.courseVersions || []).filter(v => v.courseId === courseId).map(v => v.id);

    // Primary: match publishedVersionId
    let secs = versionId ? state.sections.filter(s => s.courseVersionId === versionId) : [];

    // Secondary: match any version associated with this course (useful for draft / authoring preview)
    if (secs.length === 0 && courseVersionIds.length > 0) {
      secs = state.sections.filter(s => courseVersionIds.includes(s.courseVersionId));
    }

    // Tertiary: match by courseId direct link
    if (secs.length === 0) {
      secs = state.sections.filter(s => s.courseId === courseId);
    }

    return secs.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [state.courses, state.sections, state.courseVersions]);

  const getLessonsForCourse = useCallback((courseId) => {
    const secs = getSectionsForCourse(courseId);
    const secIds = secs.map(s => s.id);
    return state.lessons
      .filter(l => secIds.includes(l.sectionId))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [getSectionsForCourse, state.lessons]);

  const getLessonsForSection = useCallback((sectionId) => {
    return state.lessons
      .filter(l => l.sectionId === sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [state.lessons]);

  const getEnrollment = useCallback((courseId, userId) => {
    return state.enrollments.find(e => e.courseId === courseId && e.userId === (userId || currentUser.id));
  }, [state.enrollments, currentUser.id]);

  const getProgressForEnrollment = useCallback((enrollmentId) => {
    return state.progress.filter(p => p.enrollmentId === enrollmentId);
  }, [state.progress]);

  const getLessonProgress = useCallback((enrollmentId, lessonId) => {
    return state.progress.find(p => p.enrollmentId === enrollmentId && p.lessonId === lessonId);
  }, [state.progress]);

  // ── Strict Completion & Certificate Verification Engine ──
  // A learner is eligible for a certificate IF AND ONLY IF every module and every lesson in the course is completed.
  const isCourseFullyCompleted = useCallback((courseId, userId) => {
    const targetUserId = userId || currentUser.id;
    const enrollment = getEnrollment(courseId, targetUserId);
    if (!enrollment) return false;

    const sections = getSectionsForCourse(courseId);
    if (sections.length === 0) return false;

    const allLessons = getLessonsForCourse(courseId);
    if (allLessons.length === 0) return false;

    const progressRecords = getProgressForEnrollment(enrollment.id);

    // Verify every single module has at least one lesson and all its lessons are 'Completed'
    for (const sec of sections) {
      const secLessons = getLessonsForSection(sec.id);
      if (secLessons.length === 0) return false;
      for (const les of secLessons) {
        const prog = progressRecords.find(p => p.lessonId === les.id);
        if (!prog || prog.status !== 'Completed') {
          return false; // Found an incomplete lesson
        }
      }
    }

    return true;
  }, [getEnrollment, getSectionsForCourse, getLessonsForCourse, getLessonsForSection, getProgressForEnrollment, currentUser.id]);

  const getCourseCompletionDetails = useCallback((courseId, userId) => {
    const targetUserId = userId || currentUser.id;
    const sections = getSectionsForCourse(courseId);
    const allLessons = getLessonsForCourse(courseId);
    const enrollment = getEnrollment(courseId, targetUserId);
    const progressRecords = enrollment ? getProgressForEnrollment(enrollment.id) : [];

    const totalModules = sections.length;
    const totalLessons = allLessons.length;

    let completedModules = 0;
    const moduleDetails = sections.map(sec => {
      const secLessons = getLessonsForSection(sec.id);
      const secCompleted = secLessons.filter(l => {
        const p = progressRecords.find(rec => rec.lessonId === l.id);
        return p && p.status === 'Completed';
      });
      const isSecDone = secLessons.length > 0 && secCompleted.length === secLessons.length;
      if (isSecDone) completedModules++;
      return {
        id: sec.id,
        title: sec.title,
        totalLessons: secLessons.length,
        completedLessons: secCompleted.length,
        isCompleted: isSecDone,
      };
    });

    const completedLessons = allLessons.filter(l => {
      const p = progressRecords.find(rec => rec.lessonId === l.id);
      return p && p.status === 'Completed';
    }).length;

    const isFullyCompleted = totalModules > 0 && totalLessons > 0 && completedLessons === totalLessons && completedModules === totalModules;

    return {
      isFullyCompleted,
      canGetCertificate: isFullyCompleted,
      totalModules,
      completedModules,
      totalLessons,
      completedLessons,
      remainingLessons: Math.max(0, totalLessons - completedLessons),
      moduleDetails,
    };
  }, [getSectionsForCourse, getLessonsForCourse, getLessonsForSection, getEnrollment, getProgressForEnrollment, currentUser.id]);

  const calculateCourseProgress = useCallback((courseId, userId) => {
    const enrollment = getEnrollment(courseId, userId);
    if (!enrollment) return 0;
    const lessons = getLessonsForCourse(courseId);
    if (lessons.length === 0) return 0;
    const progressRecords = getProgressForEnrollment(enrollment.id);
    const completedLessons = lessons.filter(l => {
      const prog = progressRecords.find(p => p.lessonId === l.id);
      return prog && prog.status === 'Completed';
    });

    // 100% progress is granted ONLY when ALL lessons across all modules are 100% completed
    if (completedLessons.length === lessons.length && lessons.length > 0) {
      return 100;
    }

    // Floor calculation to guarantee it never rounds up to 100% while incomplete
    const pct = Math.floor((completedLessons.length / lessons.length) * 100);
    return pct >= 100 && completedLessons.length < lessons.length ? 99 : pct;
  }, [getEnrollment, getLessonsForCourse, getProgressForEnrollment]);

  const updateLessonProgress = useCallback((enrollmentId, lessonId, percentWatched) => {
    setState(s => {
      const existing = s.progress.find(p => p.enrollmentId === enrollmentId && p.lessonId === lessonId);
      if (existing) {
        return {
          ...s,
          progress: s.progress.map(p =>
            p.enrollmentId === enrollmentId && p.lessonId === lessonId
              ? { ...p, percentWatched: Math.max(p.percentWatched, percentWatched), status: percentWatched >= 90 ? 'Completed' : 'In_Progress', completedAt: percentWatched >= 90 ? new Date().toISOString() : null }
              : p
          ),
        };
      }
      return {
        ...s,
        progress: [...s.progress, {
          id: `prog-${Date.now()}`,
          enrollmentId,
          lessonId,
          status: percentWatched >= 90 ? 'Completed' : 'In_Progress',
          percentWatched,
          completedAt: percentWatched >= 90 ? new Date().toISOString() : null,
        }],
      };
    });
  }, []);

  const completeLesson = useCallback((enrollmentId, lessonId) => {
    setState(s => {
      const existing = s.progress.find(p => p.enrollmentId === enrollmentId && p.lessonId === lessonId);
      if (existing && existing.status === 'Completed') return s;
      const now = new Date().toISOString();
      if (existing) {
        return {
          ...s,
          progress: s.progress.map(p =>
            p.enrollmentId === enrollmentId && p.lessonId === lessonId
              ? { ...p, status: 'Completed', percentWatched: 100, completedAt: now }
              : p
          ),
        };
      }
      return {
        ...s,
        progress: [...s.progress, {
          id: `prog-${Date.now()}`,
          enrollmentId,
          lessonId,
          status: 'Completed',
          percentWatched: 100,
          completedAt: now,
        }],
      };
    });
  }, []);

  const checkAndCompleteCourse = useCallback((courseId, userId) => {
    const targetUserId = userId || currentUser.id;
    // Strict requirement: MUST complete all modules and every single lesson before receiving a certificate
    const isCompleted = isCourseFullyCompleted(courseId, targetUserId);
    if (!isCompleted) {
      return false; // Incomplete course -> absolutely no certificate is issued!
    }

    setState(s => {
      const enrollment = s.enrollments.find(e => e.courseId === courseId && e.userId === targetUserId);
      if (!enrollment || enrollment.status === 'Completed') return s;

      const course = s.courses.find(c => c.id === courseId);
      if (!course) return s;
      const version = s.courseVersions.find(v => v.id === enrollment.courseVersionId);
      const user = s.users.find(u => u.id === targetUserId);
      const now = new Date().toISOString();
      const certNumber = `CERT-${new Date().getFullYear()}-${course.code || 'CRS'}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const verificationCode = `VRF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const existingCert = s.certificates.find(c => c.enrollmentId === enrollment.id);
      if (existingCert) return s;

      return {
        ...s,
        enrollments: s.enrollments.map(e =>
          e.id === enrollment.id ? { ...e, status: 'Completed', completedAt: now } : e
        ),
        certificates: [...s.certificates, {
          id: `cert-${Date.now()}`,
          enrollmentId: enrollment.id,
          courseId: courseId,
          courseName: course.title,
          courseVersion: version?.versionNumber || '1.0.0',
          studentName: user?.name || 'Student',
          certificateNumber: certNumber,
          issuedAt: now,
          pdfStorageKey: `/certificates/${certNumber}.pdf`,
          verificationCode,
        }],
      };
    });
    return true;
  }, [currentUser.id, isCourseFullyCompleted]);

  const enrollAndPay = useCallback((courseId) => {
    setState(s => {
      const existing = s.enrollments.find(e => e.courseId === courseId && e.userId === s.currentUserId);
      if (existing) return s;
      const course = s.courses.find(c => c.id === courseId);
      if (!course) return s;
      const now = new Date().toISOString();
      const enrollmentId = `enr-${Date.now()}`;
      return {
        ...s,
        enrollments: [...s.enrollments, {
          id: enrollmentId,
          userId: s.currentUserId,
          courseId,
          courseVersionId: course.publishedVersionId,
          status: 'Active',
          enrolledAt: now,
          completedAt: null,
        }],
        payments: [...s.payments, {
          id: `pay-${Date.now()}`,
          enrollmentId,
          amount: course.price,
          currency: course.currency,
          status: 'Paid',
          stripeSessionId: `cs_test_${Math.random().toString(36).substr(2, 12)}`,
          paidAt: now,
        }],
      };
    });
  }, []);

  const publishCourseVersion = useCallback((courseId, changelog) => {
    let resultVersionId = null;
    setState(s => {
      const course = s.courses.find(c => c.id === courseId);
      if (!course) return s;

      const now = new Date().toISOString();
      const todayDate = now.split('T')[0];

      // Existing versions for this course
      const courseVers = s.courseVersions.filter(v => v.courseId === courseId);
      const currentPublished = s.courseVersions.find(v => v.id === course.publishedVersionId);

      let targetVersionId;
      let newCourseVersions = [...s.courseVersions];
      let newVersionNum = '1.0.0';

      if (course.status === 'Draft' || !course.publishedVersionId) {
        // Course is being published from Draft
        const draftVersion = courseVers.find(v => v.status === 'Draft') || (courseVers.length > 0 ? courseVers[courseVers.length - 1] : null);
        if (draftVersion) {
          targetVersionId = draftVersion.id;
          newVersionNum = draftVersion.versionNumber === '0.9.0' ? '1.0.0' : (draftVersion.versionNumber || '1.0.0');
          newCourseVersions = newCourseVersions.map(v =>
            v.id === targetVersionId
              ? { ...v, status: 'Published', versionNumber: newVersionNum, releaseDate: todayDate, changeSummary: changelog || 'Course published to production' }
              : v
          );
        } else {
          targetVersionId = `cv-${Date.now()}`;
          newCourseVersions.push({
            id: targetVersionId,
            courseId,
            versionNumber: '1.0.0',
            status: 'Published',
            releaseDate: todayDate,
            changeSummary: changelog || 'Initial release',
          });
        }
      } else {
        // Course is already published: publish a new version bump (e.g. 1.2.0 -> 1.3.0)
        const vNum = currentPublished && currentPublished.versionNumber != null
          ? String(currentPublished.versionNumber).split('.')
          : ['1', '0', '0'];
        const major = parseInt(vNum[0]) || 1;
        const minor = parseInt(vNum[1]) || 0;
        newVersionNum = `${major + (minor >= 9 ? 1 : 0)}.${(minor + 1) % 10}.0`;
        targetVersionId = `cv-${Date.now()}`;
        newCourseVersions.push({
          id: targetVersionId,
          courseId,
          versionNumber: newVersionNum,
          status: 'Published',
          releaseDate: todayDate,
          changeSummary: changelog || `Version ${newVersionNum} published with updated materials`,
        });
      }

      resultVersionId = targetVersionId;

      // Migrate/link sections to targetVersionId:
      // Any sections that belonged to the previous publishedVersionId, or draft version, or this course
      const oldVersionIds = courseVers.map(v => v.id);
      if (course.publishedVersionId && !oldVersionIds.includes(course.publishedVersionId)) {
        oldVersionIds.push(course.publishedVersionId);
      }

      const updatedSections = s.sections.map(sec => {
        if (sec.courseVersionId === targetVersionId) return sec;
        if (
          oldVersionIds.includes(sec.courseVersionId) ||
          sec.courseId === courseId ||
          (!sec.courseVersionId && course.id === courseId)
        ) {
          return { ...sec, courseVersionId: targetVersionId };
        }
        return sec;
      });

      // Update course record
      const updatedCourses = s.courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            status: 'Published',
            publishedVersionId: targetVersionId,
            updatedAt: now,
          };
        }
        return c;
      });

      // Recalculate metrics
      const publishedCount = updatedCourses.filter(c => c.status === 'Published').length;
      const draftCount = updatedCourses.filter(c => c.status === 'Draft').length;

      // Add a system notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        userId: s.currentUserId || 'user-admin-1',
        type: 'course',
        title: 'Course Published',
        message: `"${course.title}" v${newVersionNum} has been published successfully and is now live.`,
        read: false,
        createdAt: now,
      };

      return {
        ...s,
        courses: updatedCourses,
        courseVersions: newCourseVersions,
        sections: updatedSections,
        notifications: [newNotif, ...(s.notifications || [])],
        dashboardMetrics: {
          ...s.dashboardMetrics,
          publishedCourses: publishedCount,
          draftCourses: draftCount,
        },
      };
    });
    return resultVersionId;
  }, []);

  const unpublishCourse = useCallback((courseId) => {
    setState(s => {
      const course = s.courses.find(c => c.id === courseId);
      if (!course) return s;
      const now = new Date().toISOString();
      const updatedCourses = s.courses.map(c =>
        c.id === courseId ? { ...c, status: 'Draft', updatedAt: now } : c
      );
      const publishedCount = updatedCourses.filter(c => c.status === 'Published').length;
      const draftCount = updatedCourses.filter(c => c.status === 'Draft').length;

      const newNotif = {
        id: `notif-${Date.now()}`,
        userId: s.currentUserId || 'user-admin-1',
        type: 'course',
        title: 'Course Unpublished',
        message: `"${course.title}" was moved to Draft status.`,
        read: false,
        createdAt: now,
      };

      return {
        ...s,
        courses: updatedCourses,
        notifications: [newNotif, ...(s.notifications || [])],
        dashboardMetrics: {
          ...s.dashboardMetrics,
          publishedCourses: publishedCount,
          draftCourses: draftCount,
        },
      };
    });
  }, []);

  const addCourse = useCallback((courseData) => {
    const newCourseId = `course-${Date.now()}`;
    const newVersionId = `cv-${Date.now()}`;
    const newSectionId = `sec-${Date.now()}`;
    const newLessonId = `les-${Date.now()}`;

    const defaultSlug = (courseData.title || 'new-course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `course-${Date.now()}`;

    const newCourse = {
      id: newCourseId,
      code: courseData.code || `CRS-${Math.floor(100 + Math.random() * 900)}`,
      title: courseData.title || 'Untitled Course',
      slug: courseData.slug || defaultSlug,
      description: courseData.description || 'Comprehensive course program designed to build mastery.',
      category: courseData.category || 'Professional Skills',
      status: courseData.status || 'Draft',
      price: courseData.price !== undefined ? Number(courseData.price) : 99,
      currency: courseData.currency || 'USD',
      pricingSubtitle: courseData.pricingSubtitle || 'One-time payment • Lifetime access',
      duration: courseData.duration || '10 hours',
      thumbnailUrl: courseData.thumbnailUrl || '/thumbnails/leadership.jpg',
      features: courseData.features || [
        { icon: 'Clock', label: `${courseData.duration || '10 hours'} of content` },
        { icon: 'Award', label: 'Certificate of completion' },
        { icon: 'Monitor', label: 'Full lifetime access' },
        { icon: 'Shield', label: 'Secure Stripe payment' },
      ],
      objectives: courseData.objectives && courseData.objectives.length > 0
        ? courseData.objectives
        : ['Master key foundational concepts', 'Apply practical techniques in real scenarios', 'Earn a verified industry certificate'],
      publishedVersionId: newVersionId,
      enrollmentCount: 0,
      completionCount: 0,
      rating: 5.0,
      updatedAt: new Date().toISOString(),
    };

    const newVersion = {
      id: newVersionId,
      courseId: newCourseId,
      versionNumber: '1.0.0',
      status: courseData.status || 'Draft',
      publishedAt: new Date().toISOString(),
      changelog: 'Initial version',
    };

    const newSection = {
      id: newSectionId,
      courseVersionId: newVersionId,
      title: 'Module 1: Introduction & Foundations',
      sortOrder: 0,
    };

    const newLesson = {
      id: newLessonId,
      sectionId: newSectionId,
      title: 'Welcome & Course Orientation',
      sortOrder: 0,
      durationMinutes: 15,
      isRequired: true,
    };

    const newContentBlock = {
      id: `block-${Date.now()}`,
      lessonId: newLessonId,
      type: 'video',
      title: 'Orientation Video Lecture',
      desc: 'Watch the introductory video to get started with the program.',
      sortOrder: 0,
      req: true,
    };

    setState(s => ({
      ...s,
      courses: [newCourse, ...s.courses],
      courseVersions: [newVersion, ...s.courseVersions],
      sections: [newSection, ...s.sections],
      lessons: [newLesson, ...s.lessons],
      contentBlocks: [newContentBlock, ...s.contentBlocks],
    }));

    return newCourseId;
  }, []);

  const updateCourse = useCallback((courseId, updates) => {
    setState(s => ({
      ...s,
      courses: s.courses.map(c => c.id === courseId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c),
    }));
  }, []);

  const deleteCourse = useCallback((courseId) => {
    setState(s => {
      const versionIds = s.courseVersions.filter(v => v.courseId === courseId).map(v => v.id);
      const sectionIds = s.sections.filter(sec => versionIds.includes(sec.courseVersionId)).map(sec => sec.id);
      const lessonIds = s.lessons.filter(l => sectionIds.includes(l.sectionId)).map(l => l.id);

      return {
        ...s,
        courses: s.courses.filter(c => c.id !== courseId),
        courseVersions: s.courseVersions.filter(v => v.courseId !== courseId),
        sections: s.sections.filter(sec => !versionIds.includes(sec.courseVersionId)),
        lessons: s.lessons.filter(l => !sectionIds.includes(l.sectionId)),
        contentBlocks: s.contentBlocks.filter(cb => !lessonIds.includes(cb.lessonId)),
        enrollments: s.enrollments.filter(e => e.courseId !== courseId),
      };
    });
  }, []);

  const duplicateCourse = useCallback((courseId) => {
    const newId = `course-${Date.now()}`;
    setState(s => {
      const original = s.courses.find(c => c.id === courseId);
      if (!original) return s;
      const newCourse = {
        ...original,
        id: newId,
        code: `${original.code}-COPY`,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        status: 'Draft',
        enrollmentCount: 0,
        completionCount: 0,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...s,
        courses: [newCourse, ...s.courses],
      };
    });
    return newId;
  }, []);

  // ── Section & Lesson Mutations for Authoring ──
  const addSection = useCallback((courseVersionId, title, courseId) => {
    const newId = `sec-${Date.now()}`;
    setState(s => {
      let resolvedVersionId = courseVersionId;
      if (!resolvedVersionId && courseId) {
        const c = s.courses.find(item => item.id === courseId);
        resolvedVersionId = c?.publishedVersionId;
        if (!resolvedVersionId) {
          const v = s.courseVersions.find(item => item.courseId === courseId);
          resolvedVersionId = v?.id;
        }
      }
      if (!resolvedVersionId) {
        resolvedVersionId = `cv-${Date.now()}`;
      }

      const existingSections = s.sections.filter(sec => sec.courseVersionId === resolvedVersionId);
      const maxSort = existingSections.length > 0 ? Math.max(...existingSections.map(sec => sec.sortOrder || 0)) : 0;
      const newSec = {
        id: newId,
        courseVersionId: resolvedVersionId,
        courseId: courseId || null,
        title: title || `Module ${existingSections.length + 1}`,
        sortOrder: maxSort + 1,
      };
      return {
        ...s,
        sections: [...s.sections, newSec],
      };
    });
    return newId;
  }, []);

  const updateSection = useCallback((sectionId, updates) => {
    setState(s => ({
      ...s,
      sections: s.sections.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec),
    }));
  }, []);

  const deleteSection = useCallback((sectionId) => {
    setState(s => {
      const lessonsToDelete = s.lessons.filter(l => l.sectionId === sectionId).map(l => l.id);
      return {
        ...s,
        sections: s.sections.filter(sec => sec.id !== sectionId),
        lessons: s.lessons.filter(l => l.sectionId !== sectionId),
        contentBlocks: s.contentBlocks.filter(cb => !lessonsToDelete.includes(cb.lessonId)),
      };
    });
  }, []);

  const addLesson = useCallback((sectionId, lessonData = {}) => {
    const newId = `les-${Date.now()}`;
    setState(s => {
      const existing = s.lessons.filter(l => l.sectionId === sectionId);
      const maxSort = existing.length > 0 ? Math.max(...existing.map(l => l.sortOrder || 0)) : 0;
      const newLes = {
        id: newId,
        sectionId,
        title: lessonData.title || `Lesson ${existing.length + 1}`,
        type: lessonData.type || 'video',
        sortOrder: maxSort + 1,
        isRequired: lessonData.isRequired !== undefined ? lessonData.isRequired : true,
        completionRule: lessonData.completionRule || 'viewed',
        completionThreshold: lessonData.completionThreshold || null,
        duration: lessonData.duration || '10:00',
      };
      // Also create a default content block for this lesson, synced with lesson requirement
      const newBlock = {
        id: `cb-${Date.now()}`,
        lessonId: newId,
        type: newLes.type,
        sortOrder: 1,
        req: newLes.isRequired,
        payloadJson: {
          title: newLes.title,
          desc: lessonData.desc || `${newLes.type} block for ${newLes.title}`,
          ...(lessonData.payloadJson || {}),
        }
      };
      return {
        ...s,
        lessons: [...s.lessons, newLes],
        contentBlocks: [...s.contentBlocks, newBlock],
      };
    });
    return newId;
  }, []);

  const updateLesson = useCallback((lessonId, updates) => {
    setState(s => {
      const nextLessons = s.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l);
      // Synchronize all content blocks of this lesson if isRequired is updated
      let nextBlocks = s.contentBlocks;
      if (updates.isRequired !== undefined) {
        nextBlocks = s.contentBlocks.map(cb =>
          cb.lessonId === lessonId ? { ...cb, req: updates.isRequired } : cb
        );
      }
      return {
        ...s,
        lessons: nextLessons,
        contentBlocks: nextBlocks,
      };
    });
  }, []);

  const deleteLesson = useCallback((lessonId) => {
    setState(s => ({
      ...s,
      lessons: s.lessons.filter(l => l.id !== lessonId),
      contentBlocks: s.contentBlocks.filter(cb => cb.lessonId !== lessonId),
    }));
  }, []);

  const addContentBlock = useCallback((lessonId, blockData = {}) => {
    const newId = `cb-${Date.now()}`;
    setState(s => {
      const existing = s.contentBlocks.filter(cb => cb.lessonId === lessonId);
      const maxSort = existing.length > 0 ? Math.max(...existing.map(cb => cb.sortOrder || 0)) : 0;
      const newBlock = {
        id: newId,
        lessonId,
        type: blockData.type || 'text',
        sortOrder: maxSort + 1,
        req: blockData.req !== undefined ? blockData.req : true,
        payloadJson: blockData.payloadJson || {
          title: blockData.title || 'New Block',
          desc: blockData.desc || 'Content block',
        }
      };
      return {
        ...s,
        contentBlocks: [...s.contentBlocks, newBlock],
      };
    });
    return newId;
  }, []);

  const updateContentBlock = useCallback((blockId, updates) => {
    setState(s => ({
      ...s,
      contentBlocks: s.contentBlocks.map(cb => cb.id === blockId ? {
        ...cb,
        ...updates,
        payloadJson: updates.payloadJson ? { ...cb.payloadJson, ...updates.payloadJson } : cb.payloadJson
      } : cb),
    }));
  }, []);

  const deleteContentBlock = useCallback((blockId) => {
    setState(s => ({
      ...s,
      contentBlocks: s.contentBlocks.filter(cb => cb.id !== blockId),
    }));
  }, []);

  const getUserEnrollments = useCallback((userId) => {
    return state.enrollments.filter(e => e.userId === (userId || currentUser.id));
  }, [state.enrollments, currentUser.id]);

  const getUserCertificates = useCallback((userId) => {
    const targetUserId = userId || currentUser.id;
    const enrollments = getUserEnrollments(targetUserId);
    return state.certificates.filter(c => {
      const enr = enrollments.find(e => e.id === c.enrollmentId || (e.courseId === c.courseId && e.userId === targetUserId));
      const user = state.users.find(u => u.id === targetUserId);
      const isUserCert = (enr && enr.userId === targetUserId) || (user && c.studentName === user.name) || c.studentName === currentUser.name;
      if (!isUserCert) return false;

      // STRICT REQUIREMENT: If anyone has not completed all modules and lessons, they will NOT get certificate!
      return isCourseFullyCompleted(c.courseId, targetUserId);
    });
  }, [state.certificates, state.users, getUserEnrollments, currentUser.id, currentUser.name, isCourseFullyCompleted]);

  const getUserNotifications = useCallback((userId) => {
    return state.notifications.filter(n => n.userId === (userId || currentUser.id));
  }, [state.notifications, currentUser.id]);

  const markNotificationRead = useCallback((notifId) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => n.id === notifId ? { ...n, read: true } : n),
    }));
  }, []);

  const markAllNotificationsRead = useCallback((userId) => {
    const targetId = userId || currentUser.id;
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => n.userId === targetId ? { ...n, read: true } : n),
    }));
  }, [currentUser.id]);

  // ── Reviews & Ratings Engine ──
  const getReviewsForCourse = useCallback((courseId) => {
    return (state.reviews || []).filter(r => r.courseId === courseId);
  }, [state.reviews]);

  const getCourseRatingStats = useCallback((courseId) => {
    const courseReviews = (state.reviews || []).filter(r => r.courseId === courseId);
    if (!courseReviews.length) {
      const defaultCourse = state.courses.find(c => c.id === courseId);
      return {
        avgRating: defaultCourse?.rating || 0,
        totalReviews: courseReviews.length,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const sum = courseReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = Number((sum / courseReviews.length).toFixed(1));
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    courseReviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (dist[rounded] !== undefined) dist[rounded]++;
    });
    return {
      avgRating: avg,
      totalReviews: courseReviews.length,
      distribution: dist,
    };
  }, [state.reviews, state.courses]);

  const addReview = useCallback((courseId, { rating, comment }) => {
    setState(s => {
      const currentReviews = s.reviews || [];
      const existingIndex = currentReviews.findIndex(r => r.courseId === courseId && r.userId === s.currentUserId);
      const now = new Date().toISOString();
      let updatedReviews;

      if (existingIndex >= 0) {
        updatedReviews = [...currentReviews];
        updatedReviews[existingIndex] = {
          ...updatedReviews[existingIndex],
          rating: Number(rating),
          comment,
          createdAt: now,
        };
      } else {
        const newReview = {
          id: `rev-${Date.now()}`,
          courseId,
          userId: s.currentUserId,
          userName: currentUser.name,
          userRole: currentUser.role || 'Student',
          rating: Number(rating),
          comment,
          createdAt: now,
          helpfulCount: 0,
        };
        updatedReviews = [newReview, ...currentReviews];
      }

      // Recompute course average rating
      const courseReviews = updatedReviews.filter(r => r.courseId === courseId);
      const avg = Number((courseReviews.reduce((acc, r) => acc + r.rating, 0) / courseReviews.length).toFixed(1));

      return {
        ...s,
        reviews: updatedReviews,
        courses: s.courses.map(c => c.id === courseId ? { ...c, rating: avg } : c),
      };
    });
  }, [currentUser]);

  const deleteReview = useCallback((reviewId) => {
    setState(s => {
      const reviewToDelete = (s.reviews || []).find(r => r.id === reviewId);
      const updatedReviews = (s.reviews || []).filter(r => r.id !== reviewId);
      let updatedCourses = s.courses;
      if (reviewToDelete) {
        const remaining = updatedReviews.filter(r => r.courseId === reviewToDelete.courseId);
        const avg = remaining.length
          ? Number((remaining.reduce((acc, r) => acc + r.rating, 0) / remaining.length).toFixed(1))
          : 0;
        updatedCourses = s.courses.map(c => c.id === reviewToDelete.courseId ? { ...c, rating: avg } : c);
      }
      return {
        ...s,
        reviews: updatedReviews,
        courses: updatedCourses,
      };
    });
  }, []);

  const voteReviewHelpful = useCallback((reviewId) => {
    setState(s => ({
      ...s,
      reviews: (s.reviews || []).map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r),
    }));
  }, []);

  // ── Assignment System ──
  const getAssignmentsForCourse = useCallback((courseId) => {
    return (state.assignments || []).filter(a => a.courseId === courseId);
  }, [state.assignments]);

  const addAssignment = useCallback((assignmentData) => {
    const newAssignment = {
      id: `assign-${Date.now()}`,
      maxMarks: 100,
      passingMarks: 70,
      allowedFormats: ['PDF', 'DOCX', 'ZIP'],
      createdAt: new Date().toISOString(),
      ...assignmentData,
    };
    setState(s => ({
      ...s,
      assignments: [...(s.assignments || []), newAssignment],
    }));
    return newAssignment;
  }, []);

  const updateAssignment = useCallback((assignmentId, updates) => {
    setState(s => ({
      ...s,
      assignments: (s.assignments || []).map(a => a.id === assignmentId ? { ...a, ...updates } : a),
    }));
  }, []);

  const deleteAssignment = useCallback((assignmentId) => {
    setState(s => ({
      ...s,
      assignments: (s.assignments || []).filter(a => a.id !== assignmentId),
      submissions: (s.submissions || []).filter(sub => sub.assignmentId !== assignmentId),
    }));
  }, []);

  const submitAssignment = useCallback((assignmentId, { fileName, fileSize, fileData, notes }) => {
    const assignment = (state.assignments || []).find(a => a.id === assignmentId);
    if (!assignment) return null;

    const now = new Date();
    const isLate = assignment.deadline && new Date(assignment.deadline) < now;
    const nowIso = now.toISOString();

    let submissionResult = null;

    setState(s => {
      const currentSubs = s.submissions || [];
      const existingIndex = currentSubs.findIndex(sub => sub.assignmentId === assignmentId && sub.userId === s.currentUserId);

      if (existingIndex >= 0) {
        const updated = [...currentSubs];
        updated[existingIndex] = {
          ...updated[existingIndex],
          fileName: fileName || updated[existingIndex].fileName,
          fileSize: fileSize || updated[existingIndex].fileSize,
          fileData: fileData || updated[existingIndex].fileData,
          notes: notes !== undefined ? notes : updated[existingIndex].notes,
          submittedAt: nowIso,
          status: isLate ? 'Late' : 'Submitted',
        };
        submissionResult = updated[existingIndex];
        return { ...s, submissions: updated };
      } else {
        const newSub = {
          id: `sub-${Date.now()}`,
          assignmentId,
          courseId: assignment.courseId,
          userId: s.currentUserId,
          userName: currentUser.name,
          userEmail: currentUser.email,
          fileName,
          fileSize: fileSize || '1.2 MB',
          fileData: fileData || null,
          notes: notes || '',
          submittedAt: nowIso,
          status: isLate ? 'Late' : 'Submitted',
          grade: null,
          feedback: '',
          gradedAt: null,
          gradedBy: null,
        };
        submissionResult = newSub;
        return {
          ...s,
          submissions: [newSub, ...currentSubs],
          notifications: [
            {
              id: `notif-${Date.now()}`,
              userId: s.currentUserId,
              type: 'assignment',
              title: 'Assignment Submitted',
              message: `Your work for "${assignment.title}" has been successfully uploaded.`,
              read: false,
              createdAt: nowIso,
            },
            ...s.notifications,
          ]
        };
      }
    });
    return submissionResult;
  }, [state.assignments, currentUser]);

  const gradeSubmission = useCallback((submissionId, { grade, feedback }) => {
    setState(s => {
      const submission = (s.submissions || []).find(sub => sub.id === submissionId);
      if (!submission) return s;

      const assignment = (s.assignments || []).find(a => a.id === submission.assignmentId);
      const nowIso = new Date().toISOString();

      return {
        ...s,
        submissions: s.submissions.map(sub =>
          sub.id === submissionId
            ? {
                ...sub,
                grade: Number(grade),
                feedback: feedback || '',
                status: 'Graded',
                gradedAt: nowIso,
                gradedBy: currentUser.name,
              }
            : sub
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            userId: submission.userId,
            type: 'assignment',
            title: 'Assignment Graded',
            message: `Your submission for "${assignment?.title || 'Assignment'}" has been graded: ${grade}/${assignment?.maxMarks || 100}`,
            read: false,
            createdAt: nowIso,
          },
          ...s.notifications,
        ]
      };
    });
  }, [currentUser]);

  const getUserSubmissions = useCallback((userId) => {
    const targetId = userId || currentUser.id;
    return (state.submissions || []).filter(sub => sub.userId === targetId);
  }, [state.submissions, currentUser.id]);

  // ── Coupon / Discount Code System ──
  const validateCoupon = useCallback((code, coursePrice = 0, courseId = null) => {
    if (!code || typeof code !== 'string') {
      return { valid: false, discount: 0, finalPrice: coursePrice, message: 'Please enter a coupon code' };
    }
    const cleanCode = code.trim().toUpperCase();
    const coupon = (state.coupons || []).find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, discount: 0, finalPrice: coursePrice, message: 'Invalid coupon code' };
    }
    if (!coupon.isActive) {
      return { valid: false, discount: 0, finalPrice: coursePrice, message: 'This coupon is no longer active' };
    }
    if (coupon.validUntil) {
      const expDate = new Date(coupon.validUntil);
      if (!coupon.validUntil.includes('T')) {
        expDate.setHours(23, 59, 59, 999);
      }
      if (expDate < new Date()) {
        return { valid: false, discount: 0, finalPrice: coursePrice, message: 'This coupon has expired' };
      }
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discount: 0, finalPrice: coursePrice, message: 'Coupon usage limit reached' };
    }
    if (coupon.minOrderAmount && coursePrice < coupon.minOrderAmount) {
      return { valid: false, discount: 0, finalPrice: coursePrice, message: `Minimum course price of $${coupon.minOrderAmount} required for this coupon` };
    }
    if (coupon.applicableCourses && coupon.applicableCourses.length > 0 && courseId) {
      if (!coupon.applicableCourses.includes(courseId)) {
        return { valid: false, discount: 0, finalPrice: coursePrice, message: 'This coupon does not apply to this specific course' };
      }
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Number(((coursePrice * coupon.value) / 100).toFixed(2));
    } else {
      discount = Number(Math.min(coupon.value, coursePrice).toFixed(2));
    }

    const finalPrice = Math.max(0, Number((coursePrice - discount).toFixed(2)));
    return {
      valid: true,
      coupon,
      discount,
      finalPrice,
      message: `Coupon "${coupon.code}" applied! You saved $${discount.toFixed(2)}.`,
    };
  }, [state.coupons]);

  const addCoupon = useCallback((couponData) => {
    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: couponData.code.trim().toUpperCase(),
      type: couponData.type || 'percentage',
      value: Number(couponData.value) || 10,
      description: couponData.description || '',
      minOrderAmount: Number(couponData.minOrderAmount) || 0,
      maxUses: Number(couponData.maxUses) || 100,
      usedCount: 0,
      validUntil: couponData.validUntil || '2026-12-31',
      applicableCourses: couponData.applicableCourses || [],
      isActive: true,
    };
    setState(s => ({
      ...s,
      coupons: [newCoupon, ...(s.coupons || [])],
    }));
    return newCoupon;
  }, []);

  const updateCoupon = useCallback((couponId, updates) => {
    setState(s => ({
      ...s,
      coupons: (s.coupons || []).map(c => c.id === couponId ? { ...c, ...updates } : c),
    }));
  }, []);

  const deleteCoupon = useCallback((couponId) => {
    setState(s => ({
      ...s,
      coupons: (s.coupons || []).filter(c => c.id !== couponId),
    }));
  }, []);

  // ── Payment & Invoice Processing System ──
  const processEnrollmentPayment = useCallback(({
    courseId,
    gateway = 'stripe',
    couponCode = null,
    paymentDetails = {}
  }) => {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return { success: false, message: 'Course not found' };

    const existingEnrollment = (state.enrollments || []).find(
      e => e.courseId === courseId && e.userId === state.currentUserId
    );
    if (existingEnrollment) {
      return { success: false, message: 'You are already enrolled in this course', enrollmentId: existingEnrollment.id };
    }

    const couponResult = couponCode ? validateCoupon(couponCode, course.price, courseId) : null;
    const finalAmount = couponResult && couponResult.valid ? couponResult.finalPrice : course.price;
    const discountAmount = couponResult && couponResult.valid ? couponResult.discount : 0;

    const nowIso = new Date().toISOString();
    const enrollmentId = `enr-${Date.now()}`;
    const paymentId = `pay-${Date.now()}`;
    const invoiceId = `inv-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String((state.invoices || []).length + 1).padStart(3, '0')}`;
    const transactionId = `${gateway.toLowerCase()}_txn_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;

    const newEnrollment = {
      id: enrollmentId,
      userId: state.currentUserId,
      courseId,
      courseVersionId: course.publishedVersionId || null,
      status: 'Active',
      enrolledAt: nowIso,
      completedAt: null,
    };

    const newPayment = {
      id: paymentId,
      enrollmentId,
      courseId,
      userId: state.currentUserId,
      amount: finalAmount,
      currency: course.currency || 'USD',
      status: 'Paid',
      gateway,
      stripeSessionId: transactionId,
      couponCode: couponResult && couponResult.valid ? couponResult.coupon.code : null,
      discount: discountAmount,
      paidAt: nowIso,
    };

    const newInvoice = {
      id: invoiceId,
      invoiceNumber,
      paymentId,
      userId: state.currentUserId,
      userName: currentUser.name,
      userEmail: currentUser.email,
      courseId,
      courseTitle: course.title,
      courseCode: course.code,
      gateway: gateway.charAt(0).toUpperCase() + gateway.slice(1),
      transactionId,
      subtotal: course.price,
      discount: discountAmount,
      couponCode: couponResult && couponResult.valid ? couponResult.coupon.code : null,
      tax: 0,
      total: finalAmount,
      currency: course.currency || 'USD',
      status: 'Paid',
      issuedAt: nowIso,
    };

    setState(s => {
      // Increment coupon used count if valid coupon applied
      let updatedCoupons = s.coupons || [];
      if (couponResult && couponResult.valid) {
        updatedCoupons = updatedCoupons.map(c =>
          c.id === couponResult.coupon.id ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c
        );
      }

      return {
        ...s,
        enrollments: [...s.enrollments, newEnrollment],
        payments: [newPayment, ...s.payments],
        invoices: [newInvoice, ...(s.invoices || [])],
        coupons: updatedCoupons,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            userId: s.currentUserId,
            type: 'payment',
            title: 'Payment Successful',
            message: `Enrolled in "${course.title}". Invoice ${invoiceNumber} generated.`,
            read: false,
            createdAt: nowIso,
          },
          ...s.notifications,
        ]
      };
    });

    return {
      success: true,
      enrollmentId,
      paymentId,
      invoiceId,
      invoiceNumber,
      transactionId,
      finalAmount,
    };
  }, [state.courses, state.enrollments, state.currentUserId, state.invoices, currentUser, validateCoupon]);

  const refundPayment = useCallback((paymentId) => {
    setState(s => ({
      ...s,
      payments: s.payments.map(p => p.id === paymentId ? { ...p, status: 'Refunded' } : p),
      invoices: (s.invoices || []).map(inv => inv.paymentId === paymentId ? { ...inv, status: 'Refunded' } : inv),
    }));
  }, []);

  const getInvoiceById = useCallback((invoiceId) => {
    return (state.invoices || []).find(inv => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
  }, [state.invoices]);

  const getInvoiceByPaymentId = useCallback((paymentId) => {
    return (state.invoices || []).find(inv => inv.paymentId === paymentId);
  }, [state.invoices]);

  const getUserInvoices = useCallback((userId) => {
    const targetId = userId || currentUser.id;
    return (state.invoices || []).filter(inv => inv.userId === targetId);
  }, [state.invoices, currentUser.id]);

  // ── Q&A & Discussions Actions ──
  const getDiscussionsForLesson = useCallback((lessonId) => {
    return (state.discussions || []).filter(d => d.lessonId === lessonId);
  }, [state.discussions]);

  const getDiscussionsForCourse = useCallback((courseId) => {
    return (state.discussions || []).filter(d => d.courseId === courseId);
  }, [state.discussions]);

  const getRepliesForDiscussion = useCallback((discussionId) => {
    return (state.discussionReplies || []).filter(r => r.discussionId === discussionId);
  }, [state.discussionReplies]);

  const addQuestion = useCallback(({ courseId, lessonId, title, content }) => {
    const newId = `disc-${Date.now()}`;
    const newDisc = {
      id: newId,
      courseId,
      lessonId: lessonId || null,
      userId: currentUser.id,
      userName: currentUser.name || 'Student Learner',
      userRole: currentUser.role || 'Student',
      title,
      content,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      isResolved: false,
      isPinned: false,
      replyCount: 0,
    };
    setState(s => {
      const course = (s.courses || []).find(c => c.id === courseId);
      const courseTitle = course?.title || 'Training Course';
      const targetAdmins = (s.users || []).filter(u => u.role === 'Admin' || u.role === 'Instructor');
      const adminIds = targetAdmins.length > 0 ? targetAdmins.map(u => u.id) : ['user-admin-1'];
      if (!adminIds.includes('user-admin-1')) adminIds.push('user-admin-1');

      const newNotifs = adminIds.map((adminId, idx) => ({
        id: `notif-${Date.now()}-${idx}`,
        userId: adminId,
        type: 'discussion',
        title: 'New Student Question',
        message: `${currentUser.name || 'Student'} asked: "${title.slice(0, 50)}${title.length > 50 ? '...' : ''}" in ${courseTitle}`,
        link: '/admin/discussions',
        read: false,
        createdAt: new Date().toISOString(),
      }));

      return {
        ...s,
        discussions: [newDisc, ...(s.discussions || [])],
        notifications: [...newNotifs, ...(s.notifications || [])],
      };
    });
    return newDisc;
  }, [currentUser]);

  const addReply = useCallback(({ discussionId, content }) => {
    const newId = `reply-${Date.now()}`;
    const isInstructor = currentUser.role === 'Admin' || currentUser.role === 'Instructor';
    const newReply = {
      id: newId,
      discussionId,
      userId: currentUser.id,
      userName: currentUser.name || 'User',
      userRole: currentUser.role || 'Student',
      content,
      createdAt: new Date().toISOString(),
      isInstructorEndorsed: isInstructor,
      upvotes: 0,
      upvotedBy: [],
    };
    setState(s => {
      const question = (s.discussions || []).find(d => d.id === discussionId);
      const newNotifs = [];

      if (isInstructor && question && question.userId !== currentUser.id) {
        newNotifs.push({
          id: `notif-${Date.now()}-${question.userId}`,
          userId: question.userId,
          type: 'discussion',
          title: 'Instructor Replied to Your Question',
          message: `${currentUser.name} answered: "${question.title.slice(0, 45)}..."`,
          link: `/student/learn/${question.courseId}`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (!isInstructor && question) {
        newNotifs.push({
          id: `notif-${Date.now()}-admin`,
          userId: 'user-admin-1',
          type: 'discussion',
          title: 'New Student Discussion Reply',
          message: `${currentUser.name} commented on: "${question.title.slice(0, 45)}..."`,
          link: '/admin/discussions',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      return {
        ...s,
        discussionReplies: [...(s.discussionReplies || []), newReply],
        discussions: (s.discussions || []).map(d =>
          d.id === discussionId ? { ...d, replyCount: (d.replyCount || 0) + 1 } : d
        ),
        notifications: [...newNotifs, ...(s.notifications || [])],
      };
    });
    return newReply;
  }, [currentUser]);

  const toggleUpvoteQuestion = useCallback((discussionId) => {
    setState(s => ({
      ...s,
      discussions: (s.discussions || []).map(d => {
        if (d.id !== discussionId) return d;
        const upvoted = (d.upvotedBy || []).includes(currentUser.id);
        const upvotedBy = upvoted
          ? d.upvotedBy.filter(id => id !== currentUser.id)
          : [...(d.upvotedBy || []), currentUser.id];
        return {
          ...d,
          upvotes: upvotedBy.length,
          upvotedBy,
        };
      }),
    }));
  }, [currentUser.id]);

  const toggleUpvoteReply = useCallback((replyId) => {
    setState(s => ({
      ...s,
      discussionReplies: (s.discussionReplies || []).map(r => {
        if (r.id !== replyId) return r;
        const upvoted = (r.upvotedBy || []).includes(currentUser.id);
        const upvotedBy = upvoted
          ? r.upvotedBy.filter(id => id !== currentUser.id)
          : [...(r.upvotedBy || []), currentUser.id];
        return {
          ...r,
          upvotes: upvotedBy.length,
          upvotedBy,
        };
      }),
    }));
  }, [currentUser.id]);

  const markDiscussionResolved = useCallback((discussionId, isResolved = true) => {
    setState(s => ({
      ...s,
      discussions: (s.discussions || []).map(d =>
        d.id === discussionId ? { ...d, isResolved } : d
      ),
    }));
  }, []);

  const toggleInstructorEndorsement = useCallback((replyId) => {
    setState(s => ({
      ...s,
      discussionReplies: (s.discussionReplies || []).map(r =>
        r.id === replyId ? { ...r, isInstructorEndorsed: !r.isInstructorEndorsed } : r
      ),
    }));
  }, []);

  const deleteQuestion = useCallback((discussionId) => {
    setState(s => ({
      ...s,
      discussions: (s.discussions || []).filter(d => d.id !== discussionId),
      discussionReplies: (s.discussionReplies || []).filter(r => r.discussionId !== discussionId),
    }));
  }, []);

  const deleteReply = useCallback((replyId) => {
    setState(s => {
      const reply = (s.discussionReplies || []).find(r => r.id === replyId);
      const discId = reply?.discussionId;
      return {
        ...s,
        discussionReplies: (s.discussionReplies || []).filter(r => r.id !== replyId),
        discussions: (s.discussions || []).map(d =>
          d.id === discId ? { ...d, replyCount: Math.max(0, (d.replyCount || 1) - 1) } : d
        ),
      };
    });
  }, []);

  // ── Webhook Simulator Action ──
  const triggerTestWebhook = useCallback(({ gateway = 'Stripe', eventType = 'checkout.session.completed', payload = null }) => {
    const newId = `wh-${Date.now()}`;
    const receivedAt = new Date().toISOString();
    const simulatedSignature = `sha256=${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    
    const eventPayload = payload || {
      id: `evt_sim_${Date.now()}`,
      gateway,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      data: {
        amount: 14900,
        currency: 'usd',
        status: 'succeeded',
        customer: currentUser?.email || 'student@example.com',
        timestamp: receivedAt,
      }
    };

    const newLog = {
      id: newId,
      gateway,
      eventType,
      status: 'Verified',
      responseCode: 200,
      signature: simulatedSignature,
      payload: eventPayload,
      receivedAt,
    };

    setState(s => ({
      ...s,
      webhookLogs: [newLog, ...(s.webhookLogs || [])],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: s.currentUserId,
          type: 'system',
          title: `Webhook Received (${gateway})`,
          message: `Processed event "${eventType}" with 200 OK signature verification.`,
          read: false,
          createdAt: receivedAt,
        },
        ...s.notifications,
      ]
    }));

    return newLog;
  }, [currentUser?.email]);

  // ── Media & Asset Library Actions ──
  const uploadMediaAsset = useCallback((assetData) => {
    const newAsset = {
      id: `media-${Date.now()}`,
      name: assetData.name || 'Uploaded_Asset',
      fileType: assetData.fileType || 'pdf',
      fileSize: assetData.fileSize || '2.4 MB',
      dimensions: assetData.dimensions || 'Standard',
      duration: assetData.duration || '—',
      url: assetData.url || (assetData.file ? URL.createObjectURL(assetData.file) : '#'),
      uploadedAt: new Date().toISOString(),
      usedInCourses: assetData.courseTitle ? [assetData.courseTitle] : [],
    };
    setState(s => ({
      ...s,
      mediaAssets: [newAsset, ...(s.mediaAssets || [])],
    }));
    return newAsset;
  }, []);

  const deleteMediaAsset = useCallback((assetId) => {
    setState(s => ({
      ...s,
      mediaAssets: (s.mediaAssets || []).filter(a => a.id !== assetId),
    }));
  }, []);

  const value = {
    ...state,
    currentUser,
    switchUser,
    updateUser,
    resetData,
    getLessonsForCourse,
    getSectionsForCourse,
    getLessonsForSection,
    getEnrollment,
    getProgressForEnrollment,
    getLessonProgress,
    calculateCourseProgress,
    isCourseFullyCompleted,
    getCourseCompletionDetails,
    updateLessonProgress,
    completeLesson,
    checkAndCompleteCourse,
    enrollAndPay,
    publishCourseVersion,
    unpublishCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    addSection,
    updateSection,
    deleteSection,
    addLesson,
    updateLesson,
    deleteLesson,
    addContentBlock,
    updateContentBlock,
    deleteContentBlock,
    getUserEnrollments,
    getUserCertificates,
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    theme,
    setTheme,
    toggleTheme,
    // Reviews
    getReviewsForCourse,
    getCourseRatingStats,
    addReview,
    deleteReview,
    voteReviewHelpful,
    // Assignments
    getAssignmentsForCourse,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission,
    getUserSubmissions,
    // Coupons
    validateCoupon,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    // Payments & Invoices
    processEnrollmentPayment,
    refundPayment,
    getInvoiceById,
    getInvoiceByPaymentId,
    getUserInvoices,
    // Discussions / Q&A
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
    // Webhooks
    triggerTestWebhook,
    // Media Library
    uploadMediaAsset,
    deleteMediaAsset,
  };

  return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLms() {
  const ctx = useContext(LmsContext);
  if (!ctx) throw new Error('useLms must be used within LmsProvider');
  return ctx;
}

export default LmsContext;
