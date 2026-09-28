import { useState } from 'react';
import {
  Plus, MapPin, GitFork, HelpCircle, Edit2, Trash2, Copy,
  Play, Clock, Filter, Sparkles, AlertCircle
} from 'lucide-react';

export default function InteractionSidebar({
  interactions = [],
  currentTime = 0,
  selectedInteractionId = null,
  onSelectInteraction,
  onOpenAddModal,
  onEditInteraction,
  onDeleteInteraction,
  onDuplicateInteraction,
  onSeekToInteraction
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'hotspot' | 'branching' | 'quiz'

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || secs === undefined) return '00:00';
    const totalSecs = Math.floor(secs);
    const mins = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Filter and sort chronologically by timestamp
  const filteredInteractions = interactions
    .filter((item) => {
      if (filterType === 'all') return true;
      return item.type === filterType;
    })
    .sort((a, b) => {
      const timeA = a.type === 'hotspot' ? a.startTime : a.triggerTime;
      const timeB = b.type === 'hotspot' ? b.startTime : b.triggerTime;
      return (timeA || 0) - (timeB || 0);
    });

  const countHotspots = interactions.filter((i) => i.type === 'hotspot').length;
  const countBranches = interactions.filter((i) => i.type === 'branching').length;
  const countQuizzes = interactions.filter((i) => i.type === 'quiz').length;

  const getTypeMeta = (type) => {
    switch (type) {
      case 'branching':
        return {
          icon: <GitFork size={14} />,
          label: 'Decision',
          badgeClass: 'badge-amber',
          dotColor: 'var(--amber)'
        };
      case 'quiz':
        return {
          icon: <HelpCircle size={14} />,
          label: 'Quiz',
          badgeClass: 'badge-published',
          dotColor: 'var(--emerald)'
        };
      default:
        return {
          icon: <MapPin size={14} />,
          label: 'Hotspot',
          badgeClass: 'badge-active',
          dotColor: 'var(--cyan)'
        };
    }
  };

  return (
    <div className="ivs-sidebar glass-card-static">
      {/* Header & New Interaction CTA */}
      <div className="ivs-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Interactions</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {interactions.length} {interactions.length === 1 ? 'node' : 'nodes'} configured
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenAddModal}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <Plus size={14} /> Add New
          </button>
        </div>

        {/* Filter Pills */}
        <div className="ivs-sidebar-filters">
          <button
            type="button"
            className={`ivs-filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({interactions.length})
          </button>
          <button
            type="button"
            className={`ivs-filter-btn ${filterType === 'hotspot' ? 'active' : ''}`}
            onClick={() => setFilterType('hotspot')}
          >
            Hotspots ({countHotspots})
          </button>
          <button
            type="button"
            className={`ivs-filter-btn ${filterType === 'branching' ? 'active' : ''}`}
            onClick={() => setFilterType('branching')}
          >
            Branches ({countBranches})
          </button>
          <button
            type="button"
            className={`ivs-filter-btn ${filterType === 'quiz' ? 'active' : ''}`}
            onClick={() => setFilterType('quiz')}
          >
            Quizzes ({countQuizzes})
          </button>
        </div>
      </div>

      {/* Interactions List */}
      <div className="ivs-sidebar-list">
        {filteredInteractions.length === 0 ? (
          <div className="ivs-empty-sidebar">
            <div className="ivs-empty-icon">
              <Sparkles size={28} />
            </div>
            <h5>No interactions yet</h5>
            <p>
              Pause the video at any timecode, then click "Add New" or click directly on the video frame.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenAddModal}
            >
              <Plus size={14} /> Create Interaction
            </button>
          </div>
        ) : (
          filteredInteractions.map((item) => {
            const meta = getTypeMeta(item.type);
            const isSelected = selectedInteractionId === item.id;
            const targetTime = item.type === 'hotspot' ? item.startTime : item.triggerTime;
            const isCurrentlyActive =
              item.type === 'hotspot'
                ? currentTime >= item.startTime && currentTime <= item.endTime
                : Math.abs(currentTime - item.triggerTime) <= 1;

            return (
              <div
                key={item.id}
                className={`ivs-sidebar-card ${isSelected ? 'is-selected' : ''} ${
                  isCurrentlyActive ? 'is-active-now' : ''
                }`}
                onClick={() => onSelectInteraction?.(item)}
              >
                {/* Card Top Row: Type, Title, Time */}
                <div className="ivs-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${meta.badgeClass}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>
                    {isCurrentlyActive && (
                      <span className="badge badge-published" style={{ fontSize: '9px', padding: '2px 6px' }}>
                        Active Now
                      </span>
                    )}
                  </div>

                  <span className="ivs-timestamp-badge">
                    <Clock size={11} />
                    {item.type === 'hotspot'
                      ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
                      : formatTime(item.triggerTime)}
                  </span>
                </div>

                {/* Title */}
                <h5 className="ivs-card-title">{item.title || item.question}</h5>

                {/* Details snippet */}
                <div className="ivs-card-details">
                  {item.type === 'hotspot' && (
                    <span className="ivs-detail-pill">
                      Position: X {item.x}% • Y {item.y}%
                    </span>
                  )}
                  {item.type === 'branching' && (
                    <span className="ivs-detail-pill">
                      {item.options?.length || 0} Path Choices
                    </span>
                  )}
                  {item.type === 'quiz' && (
                    <span className="ivs-detail-pill">
                      {item.choices?.length || 0} Answer Options
                    </span>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="ivs-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ivs-act-btn"
                    onClick={() => onSeekToInteraction?.(targetTime)}
                    title="Seek video to this timestamp"
                  >
                    <Play size={13} />
                    <span>Seek</span>
                  </button>

                  <button
                    type="button"
                    className="ivs-act-btn"
                    onClick={() => onEditInteraction?.(item)}
                    title="Edit interaction parameters"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    className="ivs-act-btn"
                    onClick={() => onDuplicateInteraction?.(item)}
                    title="Duplicate node"
                  >
                    <Copy size={13} />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    className="ivs-act-btn text-red"
                    onClick={() => onDeleteInteraction?.(item.id)}
                    title="Delete interaction"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
