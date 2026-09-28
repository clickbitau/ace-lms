import { useState, useEffect, useRef } from 'react';
import HotspotOverlay from './overlays/HotspotOverlay';
import BranchingOverlay from './overlays/BranchingOverlay';
import QuizOverlay from './overlays/QuizOverlay';

/**
 * OverlayRenderer
 * Positioned over the video viewport.
 * Synchronizes and displays active hotspots, branching decisions, and checkpoint quizzes.
 */
export default function OverlayRenderer({
  interactions = [],
  currentTime = 0,
  isEditor = false,
  selectedInteractionId = null,
  onSelectInteraction,
  onPauseVideo,
  onResumeVideo,
  onSeekVideo,
  isCapturingCoords = false,
  onCoordsCaptured,
  videoDuration = 0
}) {
  const containerRef = useRef(null);

  // Track which branching/quiz triggers have fired to avoid repeat loops on slight scrubbing
  const [triggeredIds, setTriggeredIds] = useState(new Set());
  const [activeBranching, setActiveBranching] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const lastTimeRef = useRef(currentTime);

  // Reset triggers if user seeks backwards significantly
  useEffect(() => {
    if (currentTime < lastTimeRef.current - 1.5) {
      // User scrubbed backward - clear triggers that are ahead of current time
      setTriggeredIds((prev) => {
        const next = new Set();
        interactions.forEach((item) => {
          if (item.triggerTime && item.triggerTime < currentTime && prev.has(item.id)) {
            next.add(item.id);
          }
        });
        return next;
      });
    }
    lastTimeRef.current = currentTime;
  }, [currentTime, interactions]);

  // Monitor branching and quiz timecodes
  useEffect(() => {
    // If an overlay modal is already open, do not trigger another one
    if (activeBranching || activeQuiz) return;

    for (const item of interactions) {
      if (item.type === 'branching' && typeof item.triggerTime === 'number') {
        const diff = Math.abs(currentTime - item.triggerTime);
        if (diff <= 0.35 && !triggeredIds.has(item.id)) {
          // Trigger Branching!
          onPauseVideo?.();
          setActiveBranching(item);
          setTriggeredIds((prev) => new Set(prev).add(item.id));
          break;
        }
      } else if (item.type === 'quiz' && typeof item.triggerTime === 'number') {
        const diff = Math.abs(currentTime - item.triggerTime);
        if (diff <= 0.35 && !triggeredIds.has(item.id)) {
          // Trigger Quiz!
          onPauseVideo?.();
          setActiveQuiz(item);
          setTriggeredIds((prev) => new Set(prev).add(item.id));
          break;
        }
      }
    }
  }, [currentTime, interactions, triggeredIds, activeBranching, activeQuiz, onPauseVideo]);

  // Click-to-place coordinate capture handler
  const handleContainerClick = (e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    const roundedX = parseFloat(x.toFixed(1));
    const roundedY = parseFloat(y.toFixed(1));

    if (isCapturingCoords && onCoordsCaptured) {
      onCoordsCaptured({ x: roundedX, y: roundedY });
    }
  };

  // Branching decision resolved
  const handleBranchSelect = (targetTime) => {
    setActiveBranching(null);
    onSeekVideo?.(targetTime);
    // Small timeout to allow seek to settle before playback resumes
    setTimeout(() => {
      onResumeVideo?.();
    }, 120);
  };

  // Quiz resolved / continued
  const handleQuizContinue = () => {
    setActiveQuiz(null);
    onResumeVideo?.();
  };

  // Active hotspots between startTime and endTime
  const activeHotspots = interactions.filter((item) => {
    if (item.type !== 'hotspot') return false;
    const inRange = currentTime >= (item.startTime || 0) && currentTime <= (item.endTime || 0);

    // In editor mode, also show if it's currently selected in the sidebar
    if (isEditor && selectedInteractionId === item.id) {
      return true;
    }
    return inRange;
  });

  return (
    <div
      ref={containerRef}
      className={`ivs-overlay-layer ${isCapturingCoords ? 'crosshair-mode' : ''}`}
      onClick={handleContainerClick}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: isCapturingCoords ? 'auto' : 'none',
        zIndex: 20
      }}
    >
      {/* Click-to-place helper banner when coordinate pick is active */}
      {isCapturingCoords && (
        <div className="ivs-capture-notice">
          <span>Click anywhere on the video frame to place hotspot coordinates</span>
        </div>
      )}

      {/* Render Active Hotspots */}
      {activeHotspots.map((hotspot) => (
        <HotspotOverlay
          key={hotspot.id}
          interaction={hotspot}
          onPauseVideo={onPauseVideo}
          onResumeVideo={onResumeVideo}
          isEditor={isEditor}
          isSelected={selectedInteractionId === hotspot.id}
          onSelect={onSelectInteraction}
        />
      ))}

      {/* Render Active Branching Decision Overlay */}
      {activeBranching && (
        <BranchingOverlay
          interaction={activeBranching}
          onChooseBranch={handleBranchSelect}
          onDismiss={() => {
            setActiveBranching(null);
            onResumeVideo?.();
          }}
          isEditor={isEditor}
        />
      )}

      {/* Render Active Quiz Overlay */}
      {activeQuiz && (
        <QuizOverlay
          interaction={activeQuiz}
          onResumeVideo={handleQuizContinue}
          onDismiss={() => {
            setActiveQuiz(null);
            onResumeVideo?.();
          }}
          isEditor={isEditor}
        />
      )}
    </div>
  );
}
