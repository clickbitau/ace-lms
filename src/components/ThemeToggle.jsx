import { useLms } from '../context/LmsContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ size = 'md', showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useLms();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
      aria-label={isLight ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: size === 'sm' ? '4px 8px' : '6px 12px',
        borderRadius: 'var(--radius-full)',
        background: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(255, 255, 255, 0.06)',
        border: isLight ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
        color: isLight ? '#0284c7' : 'var(--cyan)',
        cursor: 'pointer',
        transition: 'all var(--transition-normal)',
        boxShadow: isLight
          ? '0 2px 8px rgba(2, 132, 199, 0.12)'
          : '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: isLight ? 'rotate(0deg)' : 'rotate(360deg)'
        }}
      >
        {isLight ? (
          <Sun size={size === 'sm' ? 14 : 16} style={{ color: '#d97706' }} />
        ) : (
          <Moon size={size === 'sm' ? 14 : 16} style={{ color: 'var(--cyan)' }} />
        )}
      </div>

      {showLabel && (
        <span style={{ fontSize: size === 'sm' ? 11 : 12, fontWeight: 600 }}>
          {isLight ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
