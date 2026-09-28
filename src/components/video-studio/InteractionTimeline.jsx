import { useState, useRef, useEffect, useCallback } from 'react';
import { Info, GitFork, HelpCircle, MapPin } from 'lucide-react';

export default function InteractionTimeline({
  duration = 0,
  currentTime = 0,
  interactions = [],
  onSeek,
  onSelectInteraction,
  selectedInteractionId = null
}) {
  const trackRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverX, setHoverX] = useState(0);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || secs === undefined) return '00:00';
    const totalSecs = Math.floor(secs);
    const mins = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateTimeFromEvent = useCallback((e) => {
    if (!trackRef.current || duration <= 0) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    return ratio * duration;
  }, [duration]);

  const handleMouseDown = (e) => {
    setIsScrubbing(true);
    const newTime = calculateTimeFromEvent(e);
    onSeek?.(newTime);
  };

  const handleMouseMove = useCallback((e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    setHoverX(clickX);
    setHoverTime(ratio * (duration || 0));

    if (isScrubbing) {
      const newTime = ratio * (duration || 0);
      onSeek?.(newTime);
    }
  }, [isScrubbing, duration, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsScrubbing(false);
  }, []);

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, handleMouseMove, handleMouseUp]);

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'branching':
        return <GitFork size={11} />;
      case 'quiz':
        return <HelpCircle size={11} />;
      default:
        return <Info size={11} />;
    }
  };

  return (
    <div className="ivs-timeline-container glass-card-static">
      <div className="ivs-timeline-top">
        <div className="ivs-timeline-title">
          <span className="timeline-dot" />
          <span>Interactive Timeline Track</span>
        </div>
        <div className="ivs-timeline-legend">
          <span className="legend-item legend-hotspot">
            <span className="legend-color-dot" /> Hotspots ({interactions.filter(i => i.type === 'hotspot').length})
          </span>
          <span className="legend-item legend-branch">
            <span className="legend-color-dot" /> Decisions ({interactions.filter(i => i.type === 'branching').length})
          </span>
          <span className="legend-item legend-quiz">
            <span className="legend-color-dot" /> Quizzes ({interactions.filter(i => i.type === 'quiz').length})
          </span>
        </div>
      </div>

      {/* Interactive Timeline Track */}
      <div
        ref={trackRef}
        className="ivs-timeline-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* Progress Fill */}
        <div
          className="ivs-track-progress"
          style={{ width: `${Math.min(100, Math.max(0, currentPercent))}%` }}
        />

        {/* Hotspot Range Bars (Translucent spans across duration) */}
        {interactions.map((item) => {
          if (item.type !== 'hotspot' || duration <= 0) return null;
          const startPct = (item.startTime / duration) * 100;
          const endPct = (item.endTime / duration) * 100;
          const widthPct = Math.max(0.5, endPct - startPct);

          const isSelected = selectedInteractionId === item.id;
          const isActive = currentTime >= item.startTime && currentTime <= item.endTime;

          return (
            <div
              key={`span-${item.id}`}
              className={`ivs-timeline-hotspot-span ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`
              }}
              title={`${item.title} (${formatTime(item.startTime)} - ${formatTime(item.endTime)})`}
              onClick={(e) => {
                e.stopPropagation();
                onSeek?.(item.startTime);
                onSelectInteraction?.(item);
              }}
            />
          );
        })}

        {/* Interaction Marker Pins */}
        {interactions.map((item) => {
          if (duration <= 0) return null;
          const triggerTime = item.type === 'hotspot' ? item.startTime : item.triggerTime;
          const markerPct = (triggerTime / duration) * 100;
          const isSelected = selectedInteractionId === item.id;

          return (
            <div
              key={`marker-${item.id}`}
              className={`ivs-timeline-marker marker-${item.type} ${isSelected ? 'selected' : ''}`}
              style={{ left: `${markerPct}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onSeek?.(triggerTime);
                onSelectInteraction?.(item);
              }}
            >
              <div className="ivs-marker-pin">
                {getMarkerIcon(item.type)}
              </div>

              {/* Marker Tooltip on Hover */}
              <div className="ivs-marker-tooltip">
                <span className="tooltip-type">{item.type.toUpperCase()}</span>
                <span className="tooltip-title">{item.title}</span>
                <span className="tooltip-time">{formatTime(triggerTime)}</span>
              </div>
            </div>
          );
        })}

        {/* Playhead Scrubber Handle */}
        <div
          className="ivs-timeline-playhead"
          style={{ left: `${currentPercent}%` }}
        >
          <div className="playhead-line" />
          <div className="playhead-handle" />
        </div>

        {/* Hover Time Indicator */}
        {hoverTime !== null && (
          <div
            className="ivs-timeline-hover-time"
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Time Readout Footbar */}
      <div className="ivs-timeline-footer">
        <span>00:00</span>
        <span className="ivs-timeline-current-label">
          Current Playhead: <strong>{formatTime(currentTime)}</strong> / {formatTime(duration)}
        </span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
