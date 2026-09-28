import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, FastForward, Crosshair, Sparkles,
  AlertCircle, RefreshCw
} from 'lucide-react';
import OverlayRenderer from './OverlayRenderer';

export default function VideoPlayer({
  videoSrc,
  interactions = [],
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  isEditor = false,
  selectedInteractionId = null,
  onSelectInteraction,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  onSeek,
  isCapturingCoords = false,
  onCoordsCaptured,
  capturedCoords = null,
  onSwitchToLocalDemo
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const rafIdRef = useRef(null);

  // Time format helper: MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null || secs === undefined) return '00:00';
    const totalSecs = Math.floor(secs);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset error when video source changes
  useEffect(() => {
    setHasError(false);
    setIsBuffering(false);
  }, [videoSrc]);

  // High-precision playback time synchronization via requestAnimationFrame
  const syncPlaybackTime = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      onTimeUpdate?.(videoRef.current.currentTime);
      rafIdRef.current = requestAnimationFrame(syncPlaybackTime);
    }
  }, [onTimeUpdate]);

  useEffect(() => {
    if (isPlaying) {
      rafIdRef.current = requestAnimationFrame(syncPlaybackTime);
    } else {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    }
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isPlaying, syncPlaybackTime]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onDurationChange?.(videoRef.current.duration);
      setHasError(false);
      setIsBuffering(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current || hasError) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        onPlayStateChange?.(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    } else {
      videoRef.current.pause();
      onPlayStateChange?.(false);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      onPlayStateChange?.(false);
    }
  };

  const resumeVideo = () => {
    if (videoRef.current && videoRef.current.paused && !hasError) {
      videoRef.current.play().then(() => {
        onPlayStateChange?.(true);
      }).catch(() => {});
    }
  };

  const seekRelative = (delta) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.duration || 1000, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = target;
    onSeek?.(target);
  };

  const handleAbsoluteSeek = (targetTime) => {
    if (!videoRef.current) return;
    const bounded = Math.max(0, Math.min(videoRef.current.duration || 1000, targetTime));
    videoRef.current.currentTime = bounded;
    onSeek?.(bounded);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Keyboard controls listener (Space = play/pause, Left/Right = seek)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  // Controls auto-hide on mouse idle (in viewer mode or fullscreen)
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !isEditor) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // In editor mode, controls are always visible so authoring is seamless
  const areControlsVisible = isEditor || showControls || !isPlaying;

  return (
    <div
      ref={containerRef}
      className={`ivs-player-viewport ${isFullscreen ? 'is-fullscreen' : ''} ${
        isEditor ? 'mode-editor' : 'mode-viewer'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !isEditor && setShowControls(false)}
      tabIndex={0}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="ivs-native-video"
        playsInline
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          onPlayStateChange?.(true);
          setIsBuffering(false);
        }}
        onPause={() => onPlayStateChange?.(false)}
        onEnded={() => onPlayStateChange?.(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => {
          setIsBuffering(false);
          setHasError(false);
        }}
        onError={() => {
          setHasError(true);
          setIsBuffering(false);
        }}
        onClick={isCapturingCoords ? undefined : togglePlay}
      />

      {/* Buffering Loading Spinner */}
      {isBuffering && !hasError && (
        <div className="ivs-video-buffering-overlay">
          <RefreshCw size={36} className="spin-icon text-cyan" />
          <span>Buffering video...</span>
        </div>
      )}

      {/* Big Glowing Center Play Button when Paused */}
      {!isPlaying && !isCapturingCoords && !hasError && !isBuffering && (
        <div className="ivs-big-play-overlay" onClick={togglePlay}>
          <div className="ivs-big-play-btn" title="Click to Play Video (Space)">
            <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />
          </div>
          <span className="ivs-big-play-text">Click to Play</span>
        </div>
      )}

      {/* Error Fallback Overlay */}
      {hasError && (
        <div className="ivs-video-error-overlay">
          <div className="error-icon-box">
            <AlertCircle size={32} />
          </div>
          <h4>Video Could Not Be Loaded</h4>
          <p>The external URL may have access restrictions or network block.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setHasError(false);
              onSwitchToLocalDemo?.();
            }}
          >
            <Sparkles size={14} /> Switch to Local High-Def Demo Video
          </button>
        </div>
      )}

      {/* Interactive Overlays Layer (Hotspots, Branching Decisions, Quizzes) */}
      <OverlayRenderer
        interactions={interactions}
        currentTime={currentTime}
        videoDuration={duration}
        isEditor={isEditor}
        selectedInteractionId={selectedInteractionId}
        onSelectInteraction={onSelectInteraction}
        onPauseVideo={pauseVideo}
        onResumeVideo={resumeVideo}
        onSeekVideo={handleAbsoluteSeek}
        isCapturingCoords={isCapturingCoords}
        onCoordsCaptured={onCoordsCaptured}
      />

      {/* Click-to-Place Target Pin Indicator (Editor Mode feedback) */}
      {isEditor && capturedCoords && (
        <div
          className="ivs-placed-crosshair"
          style={{
            position: 'absolute',
            left: `${capturedCoords.x}%`,
            top: `${capturedCoords.y}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 35
          }}
        >
          <span className="crosshair-ring" />
          <span className="crosshair-center" />
          <span className="crosshair-badge">
            {capturedCoords.x}% , {capturedCoords.y}%
          </span>
        </div>
      )}

      {/* Custom Bottom Control Bar */}
      <div className={`ivs-player-controls ${areControlsVisible ? 'visible' : 'hidden'}`}>
        <div className="ivs-controls-inner">
          {/* Left: Play/Pause, Seek Buttons, Timecode */}
          <div className="ivs-controls-left">
            <button
              type="button"
              className="ivs-ctrl-btn ivs-play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            </button>

            <button
              type="button"
              className="ivs-ctrl-btn"
              onClick={() => seekRelative(-5)}
              title="Seek -5 seconds (Left Arrow)"
            >
              <SkipBack size={14} />
              <span className="btn-label-tiny">-5s</span>
            </button>

            <button
              type="button"
              className="ivs-ctrl-btn"
              onClick={() => seekRelative(-1)}
              title="Seek -1 second"
            >
              <span className="btn-label-tiny">-1s</span>
            </button>

            <button
              type="button"
              className="ivs-ctrl-btn"
              onClick={() => seekRelative(1)}
              title="Seek +1 second"
            >
              <span className="btn-label-tiny">+1s</span>
            </button>

            <button
              type="button"
              className="ivs-ctrl-btn"
              onClick={() => seekRelative(5)}
              title="Seek +5 seconds (Right Arrow)"
            >
              <SkipForward size={14} />
              <span className="btn-label-tiny">+5s</span>
            </button>

            {/* Timecode display */}
            <div className="ivs-time-display">
              <span className="ivs-current-time">{formatTime(currentTime)}</span>
              <span className="ivs-time-divider">/</span>
              <span className="ivs-duration">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume, Speed, Fullscreen */}
          <div className="ivs-controls-right">
            {/* Volume control */}
            <div className="ivs-volume-group">
              <button
                type="button"
                className="ivs-ctrl-btn"
                onClick={toggleMute}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="ivs-volume-slider"
                title="Volume"
              />
            </div>

            {/* Playback speed selector */}
            <div className="ivs-speed-dropdown">
              <select
                className="ivs-speed-select"
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                title="Playback Speed"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
              </select>
            </div>

            {/* Fullscreen toggle */}
            <button
              type="button"
              className="ivs-ctrl-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
