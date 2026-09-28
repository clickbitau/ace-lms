import { GitFork, ArrowRight, Clock, GraduationCap, CheckCircle } from 'lucide-react';

/**
 * BranchingOverlay
 * Educational decision pathway overlay that pauses the video.
 * Displays high-contrast, tactile choice cards that adapt seamlessly across Light and Dark themes.
 */
export default function BranchingOverlay({
  interaction,
  onChooseBranch,
  onDismiss,
  isEditor = false
}) {
  const {
    title = 'Learning Pathway Decision',
    description = 'The lecture paused at this milestone. Select which specialized curriculum track you wish to navigate next.',
    options = []
  } = interaction;

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (option, e) => {
    e.stopPropagation();
    onChooseBranch?.(option.jumpTo);
  };

  return (
    <div
      className="ivs-branching-backdrop"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ivs-branching-card">
        {/* Header Ribbon */}
        <div className="ivs-branching-header">
          <div className="ivs-branching-badge">
            <GraduationCap size={16} />
            <span>LEARNING PATHWAY MILESTONE</span>
          </div>

          <div className="ivs-branching-time-pill">
            <Clock size={12} />
            <span>Triggered at {formatTime(interaction.triggerTime)}</span>
          </div>
        </div>

        {/* Title & Guidance Subtitle */}
        <h3 className="ivs-branching-title">{title}</h3>
        {description && <p className="ivs-branching-desc">{description}</p>}

        {/* Tactile Choice Cards */}
        <div className="ivs-branching-options">
          {options.map((opt, idx) => (
            <button
              key={opt.id || idx}
              type="button"
              className="ivs-branching-btn"
              onClick={(e) => handleSelect(opt, e)}
            >
              <div className="ivs-branching-btn-left">
                <div className="ivs-branching-key">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="ivs-branching-text">
                  <span className="ivs-branching-label">{opt.label}</span>
                  {opt.description && (
                    <span className="ivs-branching-subtext">{opt.description}</span>
                  )}
                </div>
              </div>

              <div className="ivs-branching-btn-right">
                <span className="ivs-branching-time">
                  <Clock size={13} />
                  Jump to {formatTime(opt.jumpTo)}
                </span>
                <div className="ivs-branching-arrow">
                  <ArrowRight size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Editor Controls Footer */}
        {isEditor && (
          <div className="ivs-branching-footer">
            <span className="ivs-branching-hint">
              💡 Tip: Click any track to test video seek & resume, or dismiss to stay at current playhead.
            </span>
            <button
              type="button"
              className="ivs-dismiss-btn"
              onClick={onDismiss}
            >
              Dismiss / Close Overlay in Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
