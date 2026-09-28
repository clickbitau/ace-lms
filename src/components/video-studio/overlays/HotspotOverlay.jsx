import { useState } from 'react';
import { Info, ExternalLink, BookOpen, X, Check, FileText } from 'lucide-react';

/**
 * HotspotOverlay
 * Positioned using percentage-based coordinates (left: x%, top: y%)
 * Active between startTime and endTime
 */
export default function HotspotOverlay({
  interaction,
  onPauseVideo,
  onResumeVideo,
  isEditor = false,
  isSelected = false,
  onSelect
}) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    id,
    title = 'Interactive Hotspot',
    x = 50,
    y = 50,
    action = 'info',
    content = '',
    url = '',
    cardPosition = 'auto'
  } = interaction;

  // Determine card alignment so it doesn't clip outside video boundaries
  const isRightSide = x > 65;
  const isBottomSide = y > 65;

  const handlePinClick = (e) => {
    e.stopPropagation();
    if (isEditor && onSelect) {
      onSelect(interaction);
      return;
    }

    if (action === 'pause') {
      onPauseVideo?.();
    }
    setIsOpen(!isOpen);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    setIsOpen(false);
    if (action === 'pause') {
      onResumeVideo?.();
    }
  };

  const handleExternalLink = (e) => {
    e.stopPropagation();
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'link':
        return <ExternalLink size={14} />;
      case 'pause':
        return <BookOpen size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const getActionBadgeText = () => {
    switch (action) {
      case 'link':
        return 'REFERENCE LINK';
      case 'pause':
        return 'LECTURE STUDY NOTE';
      default:
        return 'SLIDE ANNOTATION';
    }
  };

  return (
    <div
      className={`ivs-hotspot-container ${isEditor ? 'is-editor' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isOpen || isSelected ? 40 : 20,
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pulsing Pin Trigger */}
      <button
        type="button"
        className={`ivs-hotspot-pin ${isOpen ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={handlePinClick}
        title={title}
        aria-label={title}
      >
        <span className="ivs-hotspot-ripple" />
        <span className="ivs-hotspot-dot">
          {getActionIcon()}
        </span>
      </button>

      {/* Title Label (Visible on hover in viewer, or always in editor) */}
      <div className={`ivs-hotspot-label ${isRightSide ? 'align-right' : 'align-left'}`}>
        <span>{title}</span>
      </div>

      {/* Expanded Interactive Card */}
      {isOpen && (
        <div
          className={`ivs-hotspot-card ${isRightSide ? 'pos-left' : 'pos-right'} ${
            isBottomSide ? 'pos-top' : 'pos-bottom'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ivs-hotspot-card-header">
            <div className="ivs-hotspot-card-title">
              <span className="ivs-card-icon-pill">{getActionIcon()}</span>
              <div>
                <span className="ivs-hotspot-card-badge">{getActionBadgeText()}</span>
                <h4>{title}</h4>
              </div>
            </div>
            <button
              type="button"
              className="ivs-card-close-btn"
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="ivs-hotspot-card-body">
            {content && <p className="ivs-card-text">{content}</p>}

            {action === 'link' && url && (
              <button
                type="button"
                className="btn btn-primary btn-sm ivs-hotspot-act-btn"
                onClick={handleExternalLink}
              >
                <ExternalLink size={14} /> Open Reference Resource
              </button>
            )}

            {action === 'pause' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm ivs-hotspot-act-btn"
                onClick={handleClose}
              >
                <Check size={14} /> Resume Lecture Playback
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
