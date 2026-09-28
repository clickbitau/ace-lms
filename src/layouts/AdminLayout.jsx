import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import NotificationDropdown from '../components/NotificationDropdown';
import ThemeToggle from '../components/ThemeToggle';
import {
  LayoutDashboard, BookOpen, Users, CreditCard, Award,
  BarChart3, Settings, Search, GraduationCap,
  FolderOpen, FileText, ArrowLeftRight, RefreshCcw, Menu, X,
  Compass, Video
} from 'lucide-react';

export default function AdminLayout() {
  const { currentUser, switchUser, users, resetData } = useLms();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminUser = users.find(u => u.role === 'Admin') || users[0] || currentUser;
  const studentUser = users.find(u => u.role === 'Student') || users[1];
  const effectiveUser = currentUser?.role === 'Admin' ? currentUser : adminUser;

  // Auto-switch to Admin role when inside admin panel
  useEffect(() => {
    if (currentUser?.role !== 'Admin' && adminUser) {
      switchUser(adminUser.id);
    }
  }, [currentUser?.role, adminUser, switchUser]);

  const handleRoleSwitch = () => {
    if (studentUser) {
      switchUser(studentUser.id);
      navigate('/student');
    }
  };

  const navItems = [
    { group: 'OVERVIEW', items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]},
    { group: 'CONTENT', items: [
      { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
      { to: '/admin/video-studio', icon: Video, label: 'Video Studio' },
    ]},
    { group: 'OPERATIONS', items: [
      { to: '/admin/enrollments', icon: Users, label: 'Enrollments' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
      { to: '/admin/certificates', icon: Award, label: 'Certificates' },
      { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
    ]},
    { group: 'SYSTEM', items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
      { to: '/admin/workflow', icon: Compass, label: 'Workflow Guide' },
    ]},
  ];

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={22} />
          </div>
          <h2>Training LMS</h2>
          <p>Learn • Grow • Succeed</p>
        </div>

        <nav className="sidebar-nav" onClick={() => setMobileMenuOpen(false)}>
          {navItems.map(group => (
            <div className="sidebar-group" key={group.group}>
              <div className="sidebar-group-label">{group.group}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="link-icon" size={18} />
                  {item.label}
                  {item.badge && <span className="link-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}

          <div className="sidebar-group">
            <div className="sidebar-group-label">STUDENT VIEW</div>
            <NavLink to="/student" className="sidebar-link">
              <FolderOpen className="link-icon" size={18} />
              My Learning
            </NavLink>
            <NavLink to="/courses" className="sidebar-link">
              <FileText className="link-icon" size={18} />
              Course Catalog
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(effectiveUser.name || 'Admin').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
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

      {/* Main */}
      <div className="main-content">
        {/* Top Bar */}
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
            <button className="role-switcher" onClick={handleRoleSwitch} title="Switch to Student Panel">
              <div className="role-switcher-avatar">
                {(effectiveUser.name || 'Admin').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
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
