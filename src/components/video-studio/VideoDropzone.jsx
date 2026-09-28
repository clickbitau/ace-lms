import { useState, useRef } from 'react';
import { UploadCloud, Film, PlayCircle, Link2, Sparkles, AlertCircle } from 'lucide-react';

const SAMPLE_VIDEOS = [
  {
    name: 'Classroom Lecture — Software Architecture (Recommended)',
    desc: 'University Classroom Lecture • 32.8s • Local HD video',
    url: '/classroom-lecture.mp4'
  },
  {
    name: 'Interactive Code Walkthrough & Lab Demo',
    desc: 'Technical Software Workshop • 32.8s • Local HD video',
    url: '/demo-video.mp4'
  },
  {
    name: 'Short Concept Clip — Media API Lab',
    desc: 'Micro-lecture clip • 12 seconds • Local video',
    url: '/flower.mp4'
  }
];

export default function VideoDropzone({
  onVideoSelected,
  currentVideoName,
  currentVideoSrc,
  onChangeVideo
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage('');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    setErrorMessage('');
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validExts = ['.mp4', '.webm', '.mov'];

    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    const hasValidType = validTypes.includes(file.type);

    if (!hasValidExt && !hasValidType) {
      setErrorMessage('Please select a valid video file (.mp4, .webm, or .mov)');
      return;
    }

    try {
      // 100% Client-side local blob URL
      const blobUrl = URL.createObjectURL(file);
      onVideoSelected({
        src: blobUrl,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        isLocalFile: true
      });
    } catch (err) {
      setErrorMessage('Failed to generate local video URL: ' + err.message);
    }
  };

  const handleSelectSample = (sample) => {
    onVideoSelected({
      src: sample.url,
      name: sample.name,
      isLocalFile: false
    });
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    onVideoSelected({
      src: customUrl.trim(),
      name: 'External Video Stream',
      isLocalFile: false
    });
    setCustomUrl('');
    setShowUrlInput(false);
  };

  // If a video is already loaded, render a compact status bar
  if (currentVideoSrc) {
    return (
      <div className="ivs-video-loaded-bar glass-card-static">
        <div className="ivs-loaded-info">
          <div className="ivs-loaded-icon">
            <Film size={18} />
          </div>
          <div>
            <h4 className="ivs-loaded-name">{currentVideoName || 'Current Video'}</h4>
            <span className="ivs-loaded-badge">Ready for Interactive Authoring</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleSelectSample(SAMPLE_VIDEOS[0])}
            title="Reload the default demo video"
          >
            <Sparkles size={14} className="text-cyan" /> Default Demo
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onChangeVideo?.()}
          >
            <UploadCloud size={14} /> Upload / Change Video
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ivs-dropzone-wrapper">
      {/* Main Drag & Drop Zone */}
      <div
        className={`ivs-dropzone ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div className="ivs-dropzone-icon">
          <UploadCloud size={40} />
        </div>

        <div className="ivs-dropzone-content">
          <h3>Upload Video from Your Device</h3>
          <p>
            Drag and drop your video file here, or <span className="highlight-text">browse files</span>
          </p>
          <span className="ivs-dropzone-specs">
            Supports MP4, WebM, or MOV • 100% processed in-browser via <code>URL.createObjectURL</code>
          </span>
        </div>

        {errorMessage && (
          <div className="ivs-dropzone-error" onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Alternative Options: Sample Videos or Custom URL */}
      <div className="ivs-dropzone-alternatives">
        <div className="ivs-alt-header">
          <div className="ivs-divider-line" />
          <span className="ivs-divider-text">OR TEST INSTANTLY WITH A SAMPLE VIDEO</span>
          <div className="ivs-divider-line" />
        </div>

        <div className="ivs-sample-grid">
          {SAMPLE_VIDEOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="ivs-sample-card"
              onClick={() => handleSelectSample(sample)}
            >
              <div className="ivs-sample-icon">
                <PlayCircle size={20} />
              </div>
              <div className="ivs-sample-meta">
                <span className="ivs-sample-title">{sample.name}</span>
                <span className="ivs-sample-desc">{sample.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Remote URL Toggle */}
        <div className="ivs-custom-url-section">
          {!showUrlInput ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowUrlInput(true)}
              style={{ margin: '0 auto', display: 'flex', gap: '6px' }}
            >
              <Link2 size={14} /> Or paste a direct video URL (.mp4 / .webm)
            </button>
          ) : (
            <form onSubmit={handleCustomUrlSubmit} className="ivs-url-form">
              <input
                type="url"
                className="input"
                placeholder="https://example.com/video.mp4"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Load URL
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowUrlInput(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
