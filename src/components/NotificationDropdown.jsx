import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLms } from '../context/LmsContext';
import {
  Bell, CheckCheck, BookOpen, Users, CreditCard,
  Award, Activity, Sparkles, Check, MessageSquare
} from 'lucide-react';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { currentUser, getUserNotifications, markNotificationRead, markAllNotificationsRead } = useLms();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const notifications = getUserNotifications(currentUser.id) || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'discussion':
      case 'question':
        return <MessageSquare size={16} />;
      case 'enrollment':
        return <Users size={16} />;
      case 'payment':
        return <CreditCard size={16} />;
      case 'certificate':
        return <Award size={16} />;
      case 'course':
        return <BookOpen size={16} />;
      case 'system':
      default:
        return <Activity size={16} />;
    }
  };

  return (
    <div className="notification-container" ref={containerRef}>
      <button
        className={`topbar-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="dialog" aria-label="Notifications Panel">
          <div className="notification-header">
            <div className="notification-header-title">
              <Bell size={16} style={{ color: 'var(--cyan)' }} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notification-badge-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => markAllNotificationsRead(currentUser.id)}
                style={{ fontSize: 11, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                title="Mark all as read"
              >
                <CheckCheck size={14} style={{ color: 'var(--cyan)' }} />
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={32} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  All caught up!
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  No new alerts or system updates
                </div>
              </div>
            ) : (
              notifications.map((notif) => {
                const iconClass = notif.type || 'system';
                return (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => {
                      if (!notif.read) markNotificationRead(notif.id);
                      if (notif.link) {
                        navigate(notif.link);
                        setIsOpen(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: notif.link ? 'pointer' : 'default' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (!notif.read) markNotificationRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setIsOpen(false);
                        }
                      }
                    }}
                  >
                    <div className={`notification-icon-wrap ${iconClass}`}>
                      {getIconForType(notif.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <span className="notification-title">{notif.title}</span>
                        {!notif.read && <span className="notification-dot" title="Unread" />}
                      </div>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="notification-footer">
            <span>Evergreen self-service event stream</span>
            <span>{notifications.length} {notifications.length === 1 ? 'alert' : 'alerts'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
