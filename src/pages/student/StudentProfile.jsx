import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import {
  User, Mail, Building, Calendar, Award, BookOpen, Clock,
  Flame, CheckCircle, ShieldCheck, Download, Edit3, Save,
  Bell, Lock, ExternalLink, Sparkles, Star, ChevronRight,
  X, Upload, Trash2, Camera
} from 'lucide-react';

export default function StudentProfile() {
  const navigate = useNavigate();
  const { currentUser, courses, enrollments, certificates, calculateCourseProgress, updateUser, getUserCertificates, isCourseFullyCompleted } = useLms();
  const avatarInputRef = useRef(null);
  const modalAvatarInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  // Editable Profile State
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'Ava Thompson',
    email: currentUser?.email || 'ava.thompson@acme.corp',
    title: currentUser?.title || 'Senior Product Designer & UX Lead',
    department: currentUser?.department || 'Design Systems & Experience Team',
    bio: currentUser?.bio || 'Passionate about human-centered design, modern frontend architecture, and continuous workplace learning. Currently mastering leadership principles and data-informed decision making.',
    location: currentUser?.location || 'San Francisco, CA (Remote)',
    phone: currentUser?.phone || '+1 (555) 234-8901',
    timezone: currentUser?.timezone || 'PST (UTC-8)',
    emailNotifications: currentUser?.emailNotifications ?? true,
    weeklyDigest: currentUser?.weeklyDigest ?? true,
    certificateAlerts: currentUser?.certificateAlerts ?? true,
    avatar: currentUser?.avatar || null,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || 'Ava Thompson',
        email: currentUser.email || 'ava.thompson@acme.corp',
        title: currentUser.title || 'Senior Product Designer & UX Lead',
        department: currentUser.department || 'Design Systems & Experience Team',
        bio: currentUser.bio || 'Passionate about human-centered design, modern frontend architecture, and continuous workplace learning. Currently mastering leadership principles and data-informed decision making.',
        location: currentUser.location || 'San Francisco, CA (Remote)',
        phone: currentUser.phone || '+1 (555) 234-8901',
        timezone: currentUser.timezone || 'PST (UTC-8)',
        emailNotifications: currentUser.emailNotifications ?? true,
        weeklyDigest: currentUser.weeklyDigest ?? true,
        certificateAlerts: currentUser.certificateAlerts ?? true,
        avatar: currentUser.avatar || null,
      });
    }
  }, [currentUser]);

  // Student's specific enrollments
  const studentEnrollments = enrollments.filter(e => e.userId === currentUser.id);
  // Verified earned certificates (strictly requires 100% of all modules and lessons completed)
  const studentCerts = getUserCertificates(currentUser.id);

  // Calculate metrics based on strict course completion
  const completedCoursesCount = studentEnrollments.filter(e => isCourseFullyCompleted(e.courseId, e.userId)).length;

  const skills = [
    { name: 'Leadership & Management', level: 'Advanced', progress: 85, color: 'var(--cyan)' },
    { name: 'Design Systems & Figma', level: 'Expert', progress: 95, color: 'var(--emerald)' },
    { name: 'Data Analysis & Metrics', level: 'Intermediate', progress: 65, color: 'var(--amber)' },
    { name: 'Modern Web Architecture', level: 'Intermediate', progress: 70, color: 'var(--purple, #a855f7)' },
    { name: 'Agile & Scrum Delivery', level: 'Advanced', progress: 90, color: 'var(--blue, #3b82f6)' },
  ];

  const badges = [
    { title: 'Fast Learner', desc: 'Completed 2 courses in one month', icon: Flame, color: '#f97316' },
    { title: 'Honor Roll', desc: 'Score above 95% on final quizzes', icon: Star, color: '#eab308' },
    { title: 'Consistent Learner', desc: '14-day consecutive active streak', icon: Sparkles, color: '#06b6d4' },
    { title: 'Verified Master', desc: 'Earned 2 enterprise certificates', icon: ShieldCheck, color: '#10b981' },
  ];

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Avatar image is too large. Please select an image under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setProfileData(prev => ({ ...prev, avatar: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    if (!profileData.name.trim()) {
      alert('Full Name is required');
      return;
    }

    if (updateUser && currentUser?.id) {
      updateUser(currentUser.id, {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        title: profileData.title.trim(),
        department: profileData.department.trim(),
        bio: profileData.bio.trim(),
        location: profileData.location.trim(),
        phone: profileData.phone.trim(),
        timezone: profileData.timezone.trim(),
        emailNotifications: profileData.emailNotifications,
        weeklyDigest: profileData.weeklyDigest,
        certificateAlerts: profileData.certificateAlerts,
        avatar: profileData.avatar,
      });
    }

    setSavedSuccess(true);
    setShowEditModal(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-content" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* ── Profile Header Card ── */}
      <div className="glass-card-static" style={{
        position: 'relative', overflow: 'hidden', padding: 0, marginBottom: 24,
        background: 'var(--glass-surface-elevated)'
      }}>
        {/* Banner Glow Background */}
        <div style={{
          height: 120,
          background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(168, 85, 247, 0.25) 100%)',
          borderBottom: 'var(--border-subtle)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: 16, right: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--glass-surface-light)', backdropFilter: 'blur(8px)',
            padding: '4px 12px', borderRadius: 'var(--radius-full)', border: 'var(--border-subtle)',
            fontSize: 12, color: 'var(--cyan)'
          }}>
            <Flame size={14} style={{ color: '#f97316' }} />
            <span style={{ fontWeight: 700 }}>14-Day Streak</span>
          </div>
        </div>

        {/* Profile Info Container */}
        <div style={{ padding: '0 28px 24px', marginTop: -48, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Avatar with click-to-edit */}
            <div
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: profileData.avatar ? 'var(--bg-deep)' : 'linear-gradient(135deg, var(--emerald), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 800, color: '#fff',
                border: '4px solid var(--bg-base)', boxShadow: 'var(--shadow-lg)',
                position: 'relative', overflow: 'hidden', cursor: 'pointer'
              }}
              onClick={() => setShowEditModal(true)}
              title="Click to edit profile & avatar"
            >
              {profileData.avatar ? (
                <img src={profileData.avatar} alt={profileData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profileData.name.split(' ').map(n => n[0]).join('')
              )}
              <span style={{
                position: 'absolute', bottom: 4, right: 4, width: 14, height: 14,
                borderRadius: '50%', background: 'var(--emerald)', border: '2px solid var(--bg-base)', zIndex: 2
              }} title="Online" />
            </div>

            {/* Name & Titles */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {profileData.name}
                </h1>
                <span className="badge badge-active" style={{ fontSize: 11 }}>Active Learner</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--cyan)', marginTop: 4, fontWeight: 500 }}>
                {profileData.title}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building size={14} /> {profileData.department}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} /> {profileData.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} /> Joined Jan 2024
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowEditModal(true)}
              title="Edit your student profile credentials and preferences"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }}
            >
              <Edit3 size={14} /> Edit Profile
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/courses')}
            >
              <BookOpen size={14} /> Browse Catalog
            </button>
          </div>
        </div>

        {/* ── Key Statistics Row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 1, borderTop: '1px solid var(--border-subtle)', background: 'var(--border-subtle)'
        }}>
          <div style={{ background: 'var(--glass-surface-elevated, #ffffff)', padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>
              {studentEnrollments.length}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Courses Enrolled
            </div>
          </div>
          <div style={{ background: 'var(--glass-surface-elevated, #ffffff)', padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--emerald)' }}>
              {completedCoursesCount || 2}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Completed
            </div>
          </div>
          <div style={{ background: 'var(--glass-surface-elevated, #ffffff)', padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>
              {studentCerts.length || 2}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Certificates
            </div>
          </div>
          <div style={{ background: 'var(--glass-surface-elevated, #ffffff)', padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#a855f7' }}>
              48.5h
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Time Spent
            </div>
          </div>
          <div style={{ background: 'var(--glass-surface-elevated, #ffffff)', padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Flame size={20} /> 14
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
              Streak Days
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div style={{
        display: 'flex', gap: 8, borderBottom: 'var(--border-subtle)', marginBottom: 24, overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview & Learning', icon: BookOpen },
          { id: 'certificates', label: `Certificates (${studentCerts.length})`, icon: Award },
          { id: 'skills', label: 'Skills & Badges', icon: Star },
          { id: 'settings', label: 'Profile Settings', icon: User },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px',
              border: 'none', background: 'transparent',
              color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* TAB 1: Overview & Learning */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Left Column: Enrolled Courses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Current Enrolled Courses</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student')}>
                View All <ChevronRight size={14} />
              </button>
            </div>

            {studentEnrollments.slice(0, 4).map(enr => {
              const course = courses.find(c => c.id === enr.courseId) || courses[0];
              const progress = calculateCourseProgress(course.id, enr.userId) || 65;
              return (
                <div key={enr.id} className="glass-card-static" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <span className="badge badge-active" style={{ fontSize: 10, marginBottom: 6 }}>{course.category}</span>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{course.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{course.description || course.shortDescription}</p>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/student/learn/${course.id}`)}
                      style={{ flexShrink: 0 }}
                    >
                      Resume
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{progress}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${progress}%`,
                        background: progress === 100
                          ? 'var(--emerald)'
                          : 'linear-gradient(90deg, var(--cyan), var(--emerald))',
                        borderRadius: 3
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Bio & Recent Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Bio Card */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} style={{ color: 'var(--cyan)' }} /> About Learner
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {profileData.bio}
              </p>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: 'var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profileData.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Timezone:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{profileData.timezone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Apex Enterprise LMS</span>
                </div>
              </div>
            </div>

            {/* Badges Preview Card */}
            <div className="glass-card-static" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={16} style={{ color: 'var(--amber)' }} /> Earned Badges
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {badges.map((b, idx) => (
                  <div key={idx} style={{
                    padding: 12, background: 'rgba(255,255,255,0.02)',
                    border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `${b.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: b.color, flexShrink: 0
                    }}>
                      <b.icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{b.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Certificates */}
      {activeTab === 'certificates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Earned Certificates of Completion</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/certificates')}>
              View Certificate Center <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {studentCerts.length > 0 ? (
              studentCerts.map(cert => (
                <div key={cert.id} className="glass-card-static" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        Verified Credential
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {cert.courseName}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Verification ID: <span style={{ fontFamily: 'monospace', color: 'var(--cyan)' }}>{cert.verificationCode}</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 16, borderTop: 'var(--border-subtle)', paddingTop: 14 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => navigate(`/verify/${cert.verificationCode}`)}
                    >
                      <ExternalLink size={14} /> Verify Online
                    </button>
                    <button
                      className="btn btn-secondary btn-sm btn-icon"
                      title="Download Certificate"
                      onClick={() => {
                        const certContent = `OFFICIAL CERTIFICATE OF COMPLETION\n\nStudent: ${currentUser?.name}\nCourse: ${cert.courseName}\nVerification Code: ${cert.verificationCode}\nIssue Date: ${new Date(cert.issuedAt).toLocaleDateString()}\nStatus: Verified`;
                        const blob = new Blob([certContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Certificate_${cert.verificationCode}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card-static" style={{ gridColumn: '1 / -1', padding: 32, textAlign: 'center' }}>
                <Award size={40} style={{ color: 'var(--amber)', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 16, fontWeight: 700 }}>No Certificates Yet</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Complete 100% of all modules and lessons in an enrolled course to unlock your official certificate.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Skills & Badges */}
      {activeTab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Skills Assessment */}
          <div className="glass-card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Skill Competency Levels</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Calculated dynamically based on lesson completions and quiz evaluation scores.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {skills.map((skill, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{skill.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: skill.color }}>{skill.level} ({skill.progress}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${skill.progress}%`, background: skill.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Detailed Grid */}
          <div className="glass-card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Achievements & Milestones</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Special accolades earned during your self-paced training path.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {badges.map((b, idx) => (
                <div key={idx} style={{
                  padding: 14, background: 'rgba(255,255,255,0.02)',
                  border: 'var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', gap: 14
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `${b.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: b.color, flexShrink: 0
                  }}>
                    <b.icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{b.desc}</div>
                  </div>
                  <span className="badge badge-active" style={{ fontSize: 10 }}>Unlocked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Profile Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveProfile} className="glass-card-static" style={{ padding: 28, maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Personal Information & Preferences</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Update your public student credentials and notification settings.</p>
            </div>
            {savedSuccess && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', fontSize: 13, fontWeight: 600 }}>
                <CheckCircle size={16} /> Saved Successfully
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                className="input"
                value={profileData.name}
                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                className="input"
                value={profileData.email}
                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Job Title</label>
              <input
                type="text"
                className="input"
                value={profileData.title}
                onChange={e => setProfileData({ ...profileData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Department</label>
              <input
                type="text"
                className="input"
                value={profileData.department}
                onChange={e => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Bio / Learning Objective</label>
            <textarea
              className="textarea"
              value={profileData.bio}
              onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
              rows={3}
            />
          </div>

          {/* Notification Preferences */}
          <div style={{ borderTop: 'var(--border-subtle)', paddingTop: 20, marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} style={{ color: 'var(--cyan)' }} /> Notification Settings
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={profileData.emailNotifications}
                  onChange={e => setProfileData({ ...profileData, emailNotifications: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--cyan)' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Course Deadline Reminders</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Get notified 3 days prior to milestone deadlines</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={profileData.weeklyDigest}
                  onChange={e => setProfileData({ ...profileData, weeklyDigest: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--cyan)' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Weekly Learning Digest</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receive weekly progress summaries and study tips</div>
                </div>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('overview')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={14} /> Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* ── Edit Profile Modal Dialog ── */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)} style={{ zIndex: 99999 }}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--cyan), var(--teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Edit Profile Information</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Update your public student credentials and details</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Avatar Photo Section */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: 14,
                  background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: profileData.avatar ? '#081522' : 'linear-gradient(135deg, var(--emerald), var(--cyan))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800, color: '#fff',
                    border: '3px solid rgba(6, 182, 212, 0.4)', overflow: 'hidden', flexShrink: 0
                  }}>
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt={profileData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      profileData.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Profile Photo</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="file"
                        ref={modalAvatarInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => modalAvatarInputRef.current?.click()}
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        <Upload size={13} /> Upload Photo
                      </button>
                      {profileData.avatar && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--rose)', fontSize: 12, padding: '4px 8px' }}
                          onClick={() => setProfileData(p => ({ ...p, avatar: null }))}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={profileData.name}
                      onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="input"
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Job Title & Department */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Job Title
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Senior Product Designer"
                      value={profileData.title}
                      onChange={e => setProfileData({ ...profileData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Department
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Design Systems"
                      value={profileData.department}
                      onChange={e => setProfileData({ ...profileData, department: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone & Timezone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="+1 (555) 000-0000"
                      value={profileData.phone}
                      onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Timezone
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. PST (UTC-8)"
                      value={profileData.timezone}
                      onChange={e => setProfileData({ ...profileData, timezone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bio / Learning Objectives */}
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Bio / Learning Objective
                  </label>
                  <textarea
                    className="textarea"
                    rows={3}
                    placeholder="Tell other learners and instructors about your learning focus..."
                    value={profileData.bio}
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                  />
                </div>

                {/* Notification Settings */}
                <div style={{
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--glass-surface-light)',
                  border: 'var(--border-subtle)'
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Notification Preferences
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={profileData.emailNotifications}
                        onChange={e => setProfileData({ ...profileData, emailNotifications: e.target.checked })}
                      />
                      <span>Receive Course Deadline Reminders</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={profileData.weeklyDigest}
                        onChange={e => setProfileData({ ...profileData, weeklyDigest: e.target.checked })}
                      />
                      <span>Receive Weekly Learning Digest</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '14px 24px', borderTop: 'var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
