import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ThemeToggle from '../../components/ThemeToggle';
import { WORKFLOW_MODULES } from '../../data/workflowDocumentation';
import {
  LayoutDashboard, BookOpen, Layers, ClipboardCheck, MessagesSquare,
  HardDrive, MessageSquare, Tag, Users, CreditCard, Award,
  BarChart3, Settings, User, Play, Search, ArrowRight,
  ExternalLink, ShieldCheck, CheckCircle2, AlertCircle, Sparkles,
  Menu, X, ChevronRight, GraduationCap, Compass, HelpCircle,
  RefreshCw, Info, FileText, Check, ArrowLeftRight
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard, BookOpen, Layers, ClipboardCheck, MessagesSquare,
  HardDrive, MessageSquare, Tag, Users, CreditCard, Award,
  BarChart3, Settings, User, Play, Compass, FileText
};

export default function WorkflowHub() {
  const navigate = useNavigate();
  const { currentUser } = useLms();
  const [selectedId, setSelectedId] = useState('admin-dashboard');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dual' | 'entities' | 'actions' | 'journey'
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'student'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter modules based on search and role
  const filteredModules = useMemo(() => {
    return WORKFLOW_MODULES.filter(m => {
      const matchRole = roleFilter === 'all' || m.role === roleFilter || m.role === 'both';
      const q = search.toLowerCase().trim();
      const matchSearch = !q || (
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.problemSolved.toLowerCase().includes(q) ||
        m.entities.some(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) ||
        m.actions.some(a => a.label.toLowerCase().includes(q))
      );
      return matchRole && matchSearch;
    });
  }, [search, roleFilter]);

  const selectedModule = useMemo(() => {
    return WORKFLOW_MODULES.find(m => m.id === selectedId) || filteredModules[0] || WORKFLOW_MODULES[0];
  }, [selectedId, filteredModules]);

  // Group modules for sidebar menu matching user screenshots
  const sidebarGroups = useMemo(() => {
    const groups = [
      { name: 'OVERVIEW', items: [] },
      { name: 'CONTENT', items: [] },
      { name: 'OPERATIONS', items: [] },
      { name: 'SYSTEM', items: [] },
      { name: 'STUDENT VIEW', items: [] },
    ];

    filteredModules.forEach(mod => {
      const foundGroup = groups.find(g => g.name === mod.group);
      if (foundGroup) {
        foundGroup.items.push(mod);
      } else {
        groups[0].items.push(mod);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [filteredModules]);

  const SelectedIcon = ICON_MAP[selectedModule.icon] || FileText;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Header Bar */}
      <header
        style={{
          height: '64px',
          borderBottom: 'var(--border-subtle)',
          background: 'var(--glass-surface-light)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ display: 'inline-flex' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--emerald), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                LMS Architecture & Workflow Explorer
              </h1>
              <span className="status-live" style={{ fontSize: 10 }}>Interactive Guide</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Complete feature catalog, entity dictionaries, button navigation, and dual-mode architecture
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Quick jump to Admin or Student dashboard */}
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ShieldCheck size={14} style={{ color: 'var(--cyan)' }} /> Admin Portal
          </button>
          <button
            onClick={() => navigate('/student')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <GraduationCap size={14} style={{ color: 'var(--emerald)' }} /> Student Portal
          </button>
          <ThemeToggle size="md" />
        </div>
      </header>

      {/* Main Workspace: Sidebar Explorer + Detail Pane */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Mobile Backdrop */}
        <div
          className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Left Navigation Menu (Mirrors Screenshots) */}
        <aside
          className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}
          style={{
            position: 'sticky',
            top: '64px',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            width: '280px',
            minWidth: '280px',
            borderRight: 'var(--border-subtle)',
            background: 'var(--surface-color)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 12px'
          }}
        >
          {/* Search Bar in Sidebar */}
          <div className="input-with-icon" style={{ marginBottom: 14 }}>
            <Search className="input-icon" size={15} />
            <input
              type="text"
              className="input"
              placeholder="Search workflows, entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 12, paddingLeft: 34, height: 36 }}
            />
          </div>

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 8, marginBottom: 16 }}>
            {['all', 'admin', 'student'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: roleFilter === r ? 'var(--cyan)' : 'transparent',
                  color: roleFilter === r ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {r === 'all' ? 'All (18)' : (r === 'admin' ? 'Admin' : 'Student')}
              </button>
            ))}
          </div>

          {/* Grouped Sidebar Links */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sidebarGroups.map(grp => (
              <div key={grp.name} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '4px 10px',
                    textTransform: 'uppercase'
                  }}
                >
                  {grp.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                  {grp.items.map(item => {
                    const ItemIcon = ICON_MAP[item.icon] || FileText;
                    const isSelected = item.id === selectedModule.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedId(item.id);
                          setMobileMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: isSelected ? '1px solid rgba(31, 187, 210, 0.4)' : '1px solid transparent',
                          background: isSelected ? 'rgba(31, 187, 210, 0.14)' : 'transparent',
                          color: isSelected ? 'var(--cyan)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 500,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <ItemIcon size={16} style={{ color: isSelected ? 'var(--cyan)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title.split('&')[0].trim()}
                        </span>
                        {item.role === 'both' && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              background: 'rgba(168, 85, 247, 0.15)',
                              color: '#c084fc',
                              padding: '2px 5px',
                              borderRadius: 4
                            }}
                          >
                            DUAL
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Help Footer */}
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(31, 187, 210, 0.05)',
              border: '1px solid rgba(31, 187, 210, 0.15)',
              marginTop: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--cyan)' }}>
              <Sparkles size={14} /> Living Documentation
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Click any menu on the left to inspect its live workflows, entities, and button controllers.
            </p>
          </div>
        </aside>

        {/* Right Detail Pane */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 36px',
            maxWidth: '1200px'
          }}
        >
          {/* Hero Banner for Selected Module */}
          <div
            className="glass-card-static"
            style={{
              padding: '24px 28px',
              marginBottom: 24,
              border: '1px solid rgba(31, 187, 210, 0.25)',
              background: 'linear-gradient(135deg, rgba(31, 187, 210, 0.06), rgba(16, 185, 129, 0.04))',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(31, 187, 210, 0.15)',
                    color: 'var(--cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(31, 187, 210, 0.2)'
                  }}
                >
                  <SelectedIcon size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(31, 187, 210, 0.2)',
                        color: 'var(--cyan)',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {selectedModule.group}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: selectedModule.role === 'admin'
                          ? 'rgba(168, 85, 247, 0.15)'
                          : (selectedModule.role === 'student' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(243, 156, 18, 0.15)'),
                        color: selectedModule.role === 'admin'
                          ? '#c084fc'
                          : (selectedModule.role === 'student' ? 'var(--emerald)' : '#f39c12')
                      }}
                    >
                      {selectedModule.role === 'both' ? 'Admin & Student' : (selectedModule.role === 'admin' ? 'Admin Only' : 'Student Only')}
                    </span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedModule.title}
                  </h2>
                </div>
              </div>

              {/* Direct Open Live Screen Button */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(selectedModule.liveRoute)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: '0 4px 14px rgba(31, 187, 210, 0.35)'
                }}
              >
                Open Live Screen <ArrowRight size={15} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
              {selectedModule.summary}
            </p>
          </div>

          {/* Workflow Tabs Header */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: 'var(--border-subtle)',
              marginBottom: 24,
              overflowX: 'auto',
              paddingBottom: 2
            }}
          >
            {[
              { id: 'overview', label: '1. Purpose & Problem Solved' },
              { id: 'dual', label: '2. Admin vs Student Experience' },
              { id: 'entities', label: `3. Data Entity Dictionary (${selectedModule.entities.length})` },
              { id: 'actions', label: `4. Buttons & Actions Guide (${selectedModule.actions.length})` },
              { id: 'journey', label: '5. Step-by-Step User Journey' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid var(--cyan)' : '2px solid transparent',
                  color: activeTab === t.id ? 'var(--cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Purpose & Problem Solved */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-card-static" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Info size={18} style={{ color: 'var(--cyan)' }} />
                  What is on this screen?
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {selectedModule.summary}
                </p>
              </div>

              <div
                className="glass-card-static"
                style={{
                  padding: 24,
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ShieldCheck size={18} />
                  What Problem It Solves
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                  {selectedModule.problemSolved}
                </p>
              </div>

              <div className="glass-card-static" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Route & Live Placement
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <code style={{ background: 'var(--bg-app)', padding: '6px 12px', borderRadius: 6, fontSize: 13, color: 'var(--cyan)' }}>
                    {selectedModule.liveRoute}
                  </code>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Accessible via sidebar under <strong>{selectedModule.group}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dual Mode Comparison (Admin vs Student) */}
          {activeTab === 'dual' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Admin Card */}
              <div
                className="glass-card-static"
                style={{
                  padding: 24,
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  background: 'rgba(168, 85, 247, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#c084fc' }}>Admin Operations View</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Control, Oversight & Automation</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedModule.dualPerspective.adminView}
                </p>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: 'var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#c084fc' }}>
                  <Check size={14} /> Full management, authoring, and auditing permissions.
                </div>
              </div>

              {/* Student Card */}
              <div
                className="glass-card-static"
                style={{
                  padding: 24,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--emerald)' }}>Student Learning View</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Self-Paced Learner Engagement</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {selectedModule.dualPerspective.studentView}
                </p>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: 'var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--emerald)' }}>
                  <Check size={14} /> Self-service learning, coursework submission, instant diplomas.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Data Entity Dictionary */}
          {activeTab === 'entities' && (
            <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: 'var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Data Entities, Columns & Metrics Dictionary
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Explains what every column, field, and calculation on this page represents and how its status updates.
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 160 }}>Entity / Column Name</th>
                      <th style={{ width: 140 }}>Data Type</th>
                      <th>Operational Meaning & Function</th>
                      <th style={{ minWidth: 180 }}>Lifecycle / State Transition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedModule.entities.map((ent, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                            {ent.name}
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge badge-active"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: 'rgba(31, 187, 210, 0.12)',
                              color: 'var(--cyan)'
                            }}
                          >
                            {ent.type}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {ent.description}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: 'var(--emerald)', fontFamily: 'monospace', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 6px', borderRadius: 4 }}>
                            {ent.lifecycle}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Action Buttons Guide */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="glass-card-static" style={{ padding: '16px 20px', marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Action Controllers & Button Navigation Guide
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Complete inventory of interactive buttons on this page, including where they navigate and what background operations they execute.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {selectedModule.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="glass-card-static"
                    style={{
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span
                          className={`btn btn-${act.variant === 'card' ? 'secondary' : act.variant} btn-sm`}
                          style={{ pointerEvents: 'none', fontSize: 12 }}
                        >
                          {act.label}
                        </span>
                        <code style={{ fontSize: 10, color: 'var(--cyan)' }}>
                          {act.destination}
                        </code>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Step-by-Step User Journey */}
          {activeTab === 'journey' && (
            <div className="glass-card-static" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Chronological User Journey Workflow
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
                Walkthrough of how users interact with this screen from trigger to resolution.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {selectedModule.userJourney.map(j => (
                  <div key={j.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}
                    >
                      {j.step}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 16, borderBottom: 'var(--border-subtle)' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {j.title}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {j.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
