import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import NotificationDropdown from '../components/NotificationDropdown';
import ThemeToggle from '../components/ThemeToggle';
import {
  BookOpen, Award, User, Search, CreditCard,
  ArrowLeftRight, GraduationCap, LayoutDashboard, RefreshCcw, Menu, X,
  Compass
} from 'lucide-react';

export default function StudentLayout() {
  const { currentUser, switchUser, users, resetData } = useLms();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentUser = users.find(u => u.role === 'Student') || users[1] || currentUser;
  const adminUser = users.find(u => u.role === 'Admin') || users[0];
  const effectiveUser = currentUser?.role === 'Student' ? currentUser : studentUser;

  // Auto-switch to Student role when inside student panel
  useEffect(() => {
    if (currentUser?.role !== 'Student' && studentUser) {
      switchUser(studentUser.id);
    }
  }, [currentUser?.role, studentUser, switchUser]);

  const handleRoleSwitch = () => {
    if (adminUser) {
      switchUser(adminUser.id);
      navigate('/admin');
    }
  };

  const avatarInitials = (effectiveUser.name || 'Student')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={22} />
          </div>
          <h2>Training LMS</h2>
          <p>Learn • Grow • Succeed</p>
        </div>

        <nav className="sidebar-nav" onClick={() => setMobileMenuOpen(false)}>
          <div className="sidebar-group">
            <NavLink to="/student" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard className="link-icon" size={18} />
              My Learning
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BookOpen className="link-icon" size={18} />
              Browse Courses
            </NavLink>
            <NavLink to="/student/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard className="link-icon" size={18} />
              Payment History
            </NavLink>
            <NavLink to="/student/certificates" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Award className="link-icon" size={18} />
              Certificates
            </NavLink>
            <NavLink to="/student/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User className="link-icon" size={18} />
              Profile
            </NavLink>
            <NavLink to="/student/workflow" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Compass className="link-icon" size={18} />
              Workflow Guide
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, var(--emerald), var(--cyan))' }}>
            {avatarInitials}
          </div>
          <div className="sidebar-user-info">
            <h4>{effectiveUser.name}</h4>
            <p>{effectiveUser.role}</p>
          </div>
          <button onClick={resetData} title="Reset demo data" style={{ marginLeft: 'auto', color: 'var(--text-muted)', padding: 4 }}>
            <RefreshCcw size={14} />
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="status-live">Live</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search className="search-icon" size={16} />
              <input type="text" className="input" placeholder="Search courses..." />
            </div>
            <NotificationDropdown />
            <ThemeToggle size="md" />
            <button className="role-switcher" onClick={handleRoleSwitch} title="Switch to Admin Panel">
              <div className="role-switcher-avatar" style={{ background: 'linear-gradient(135deg, var(--emerald), var(--cyan))' }}>
                {avatarInitials}
              </div>
              <div>
                <span>{effectiveUser.name}</span>
                <div className="role-label">{effectiveUser.role}</div>
              </div>
              <ArrowLeftRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
