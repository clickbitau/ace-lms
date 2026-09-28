import { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  HardDrive, Upload, Search, Filter, Trash2, Copy, Check,
  ExternalLink, Play, Eye, FileText, Presentation, Headphones,
  Image, Video, Sparkles, CheckCircle2, Clock, X, Layers
} from 'lucide-react';

export default function MediaLibrary() {
  const { mediaAssets, uploadMediaAsset, deleteMediaAsset } = useLms();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'video' | 'audio' | 'slides' | 'pdf' | 'image'
  const [selectedAssetForPreview, setSelectedAssetForPreview] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);

  // File upload input states
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('slides');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filtered assets list
  const filteredAssets = useMemo(() => {
    return (mediaAssets || []).filter(a => {
      if (typeFilter !== 'all' && a.fileType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = a.name.toLowerCase().includes(q);
        const courseMatch = (a.usedInCourses || []).some(c => c.toLowerCase().includes(q));
        if (!nameMatch && !courseMatch) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [mediaAssets, typeFilter, search]);

  const handleCopyLink = (asset) => {
    navigator.clipboard?.writeText(asset.url || window.location.href);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      processSimulatedUpload(files[0]);
    }
  };

  const processSimulatedUpload = (file) => {
    let type = 'pdf';
    if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('image/')) type = 'image';
    else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) type = 'slides';

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const newAsset = uploadMediaAsset({
      name: file.name,
      fileType: type,
      fileSize: sizeMb,
      dimensions: type === 'video' ? '1080p HD' : (type === 'image' ? '1920x1080' : 'Standard'),
      duration: type === 'video' ? '12:00 mins' : (type === 'audio' ? '10:00 mins' : '15 Pages'),
      file,
    });

    setUploadNotice(`Successfully uploaded "${newAsset.name}" to Cloud Storage!`);
    setTimeout(() => setUploadNotice(null), 5000);
    setShowUploadModal(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'slides': return <Presentation size={18} style={{ color: 'var(--cyan)' }} />;
      case 'audio': return <Headphones size={18} style={{ color: 'var(--amber)' }} />;
      case 'video': return <Video size={18} style={{ color: '#e11d48' }} />;
      case 'image': return <Image size={18} style={{ color: 'var(--emerald)' }} />;
      default: return <FileText size={18} style={{ color: 'var(--cyan)' }} />;
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Media & Cloud Asset Storage</h1>
          <p>Central repository for presentation slide decks, audio podcasts, high-definition videos, and handbook documents.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Upload size={16} /> Upload New Asset
        </button>
      </div>

      {/* Storage Quota Card */}
      <div className="glass-card-static" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HardDrive size={22} style={{ color: 'var(--cyan)' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Amazon S3 Dedicated Bucket (us-east-1)</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>SSL encrypted with CloudFront CDN edge caching</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>124.6 GB / 500.0 GB</div>
            <div style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 600 }}>375.4 GB Available (24.9% used)</div>
          </div>
        </div>

        <div className="progress-bar" style={{ height: 8, borderRadius: 4 }}>
          <div className="progress-bar-fill" style={{ width: '24.9%', background: 'linear-gradient(90deg, var(--cyan), var(--emerald))' }} />
        </div>
      </div>

      {/* Upload Notification */}
      {uploadNotice && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
          borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--emerald)',
          fontSize: 13, fontWeight: 600, marginBottom: 20
        }}>
          <CheckCircle2 size={18} /> {uploadNotice}
        </div>
      )}

      {/* Drag & Drop Quick Dropzone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => setShowUploadModal(true)}
        style={{
          border: isDragging ? '2px dashed var(--cyan)' : '2px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 20px',
          textAlign: 'center',
          background: isDragging ? 'rgba(31, 187, 210, 0.08)' : 'rgba(23, 40, 59, 0.4)',
          cursor: 'pointer',
          marginBottom: 24,
          transition: 'all 0.2s ease'
        }}
      >
        <Upload size={32} style={{ color: isDragging ? 'var(--cyan)' : 'var(--text-muted)', margin: '0 auto 10px' }} />
        <h4 style={{ margin: '0 0 4px 0', fontSize: 15, color: 'var(--text-primary)' }}>
          Drag & Drop Media Files Here, or Click to Browse
        </h4>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
          Supports MP4, WEBM, MP3, WAV, PPTX, PDF, PNG, and JPG up to 500 MB per file.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 24,
        padding: '12px 16px', background: 'var(--glass-surface)',
        borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)'
      }}>
        {/* Type Filter Buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'slides', label: 'Slide Decks' },
            { id: 'audio', label: 'Audio' },
            { id: 'video', label: 'Videos' },
            { id: 'pdf', label: 'PDFs' },
            { id: 'image', label: 'Images' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={`btn btn-sm ${typeFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 11, padding: '4px 12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="input-with-icon" style={{ minWidth: 220, maxWidth: 320, flex: 1 }}>
          <Search className="input-icon" size={14} />
          <input
            type="text"
            className="input input-sm"
            placeholder="Search media files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Media Grid View */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20
      }}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="glass-card-static"
              style={{
                padding: 16, display: 'flex', flexDirection: 'column',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {/* Asset Thumbnail Canvas */}
              <div style={{
                height: 140, borderRadius: 'var(--radius-md)',
                background: asset.fileType === 'slides'
                  ? 'linear-gradient(135deg, rgba(31, 187, 210, 0.2), #0f1f2e)'
                  : (asset.fileType === 'audio'
                    ? 'linear-gradient(135deg, rgba(243, 156, 18, 0.2), #0f1f2e)'
                    : (asset.fileType === 'video'
                      ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.2), #0f1f2e)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), #0f1f2e)')),
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', marginBottom: 12
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(23, 40, 59, 0.8)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {getTypeIcon(asset.fileType)}
                </div>

                <span style={{
                  position: 'absolute', bottom: 8, right: 8,
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {asset.duration || asset.dimensions}
                </span>

                <span style={{
                  position: 'absolute', top: 8, left: 8,
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(23, 40, 59, 0.85)', color: 'var(--cyan)',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  border: '1px solid rgba(31, 187, 210, 0.3)'
                }}>
                  {asset.fileType}
                </span>
              </div>

              {/* File Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                  margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={asset.name}>
                  {asset.name}
                </h4>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {asset.fileSize} • Uploaded {new Date(asset.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Used In Courses Chips */}
                {asset.usedInCourses && asset.usedInCourses.length > 0 && (
                  <div style={{ marginTop: 'auto', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Used in Curriculum:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {asset.usedInCourses.map((cName, i) => (
                        <span key={i} className="badge badge-draft" style={{ fontSize: 10, padding: '2px 6px' }}>
                          {cName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 10, borderTop: 'var(--border-subtle)', marginTop: 8
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedAssetForPreview(asset)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px' }}
                >
                  <Eye size={12} /> Preview
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(asset)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', color: 'var(--cyan)' }}
                    title="Copy asset URL"
                  >
                    {copiedId === asset.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId === asset.id ? 'Copied' : 'Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMediaAsset(asset.id)}
                    className="btn btn-ghost btn-icon btn-sm"
                    title="Delete Asset"
                    style={{ color: 'var(--red)', padding: 4 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card-static" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <HardDrive size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No Media Assets Found</h3>
            <p style={{ maxWidth: 420, margin: '0 auto 16px', fontSize: 13 }}>
              {search ? `No files matching "${search}".` : 'No media assets found in this category. Upload slide decks, audio recordings, or videos above.'}
            </p>
          </div>
        )}
      </div>

      {/* Asset Preview Modal */}
      {selectedAssetForPreview && (
        <div className="modal-backdrop" onClick={() => setSelectedAssetForPreview(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {getTypeIcon(selectedAssetForPreview.fileType)}
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{selectedAssetForPreview.name}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {selectedAssetForPreview.fileSize} • {selectedAssetForPreview.fileType.toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedAssetForPreview(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                minHeight: 280, borderRadius: 'var(--radius-md)', background: '#0a1520',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 24, textAlign: 'center', marginBottom: 16, border: 'var(--border-subtle)'
              }}>
                {selectedAssetForPreview.fileType === 'slides' && (
                  <div>
                    <Presentation size={48} style={{ color: 'var(--cyan)', margin: '0 auto 12px' }} />
                    <h4 style={{ color: '#fff', marginBottom: 6 }}>Interactive Slide Deck Ready</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, margin: '0 auto 16px' }}>
                      Ready to be linked directly to lessons in the Course Authoring Studio.
                    </p>
                  </div>
                )}

                {selectedAssetForPreview.fileType === 'audio' && (
                  <div>
                    <Headphones size={48} style={{ color: 'var(--amber)', margin: '0 auto 12px' }} />
                    <h4 style={{ color: '#fff', marginBottom: 6 }}>Studio Audio Master</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, margin: '0 auto 16px' }}>
                      320kbps MP3 stream ready for in-lesson playback and background listening.
                    </p>
                  </div>
                )}

                {selectedAssetForPreview.fileType === 'video' && (
                  <div>
                    <Play size={48} style={{ color: '#e11d48', margin: '0 auto 12px' }} />
                    <h4 style={{ color: '#fff', marginBottom: 6 }}>High-Definition Video</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, margin: '0 auto 16px' }}>
                      1080p MP4 file hosted on CDN edge for smooth multi-bitrate streaming.
                    </p>
                  </div>
                )}

                {selectedAssetForPreview.fileType === 'pdf' && (
                  <div>
                    <FileText size={48} style={{ color: 'var(--cyan)', margin: '0 auto 12px' }} />
                    <h4 style={{ color: '#fff', marginBottom: 6 }}>PDF Document & Syllabus</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, margin: '0 auto 16px' }}>
                      Formatted document prepared for in-browser viewing or student offline download.
                    </p>
                  </div>
                )}

                {selectedAssetForPreview.fileType === 'image' && (
                  <div>
                    <Image size={48} style={{ color: 'var(--emerald)', margin: '0 auto 12px' }} />
                    <h4 style={{ color: '#fff', marginBottom: 6 }}>High-Resolution Architecture Diagram</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 400, margin: '0 auto 16px' }}>
                      PNG vector asset for course thumbnails and lesson illustrations.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                <div><strong>Cloud Storage URL:</strong> <div style={{ fontFamily: 'monospace', color: 'var(--cyan)', wordBreak: 'break-all' }}>{selectedAssetForPreview.url}</div></div>
                <div><strong>Dimensions / Duration:</strong> <div style={{ color: 'var(--text-secondary)' }}>{selectedAssetForPreview.dimensions || selectedAssetForPreview.duration}</div></div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedAssetForPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 16 }}>Upload Media to Asset Library</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Asset Title / File Name
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Masterclass_Slides_Module_3.pptx"
                  value={uploadFileName}
                  onChange={e => setUploadFileName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Media Asset Type
                </label>
                <select
                  className="select"
                  value={uploadFileType}
                  onChange={e => setUploadFileType(e.target.value)}
                >
                  <option value="slides">Presentation Slides (.pptx / Google Slides)</option>
                  <option value="audio">Audio Lecture (.mp3 / podcast)</option>
                  <option value="video">Video Stream (.mp4 / 1080p)</option>
                  <option value="pdf">PDF Handbook / Worksheet</option>
                  <option value="image">Diagram / Illustrated Artwork</option>
                </select>
              </div>

              <div style={{
                padding: 24, border: '2px dashed rgba(31, 187, 210, 0.3)',
                borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'rgba(31, 187, 210, 0.04)'
              }}>
                <Upload size={28} style={{ color: 'var(--cyan)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Select File from Computer
                </div>
                <input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      if (!uploadFileName) setUploadFileName(f.name);
                    }
                  }}
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const name = uploadFileName.trim() || 'New_Course_Asset.pdf';
                  const newAsset = uploadMediaAsset({
                    name,
                    fileType: uploadFileType,
                    fileSize: '18.4 MB',
                    dimensions: uploadFileType === 'video' ? '1080p HD' : (uploadFileType === 'image' ? '1920x1080' : 'Standard'),
                    duration: uploadFileType === 'slides' ? '20 Slides' : (uploadFileType === 'audio' ? '15:30 mins' : '15 Pages'),
                  });
                  setUploadNotice(`Uploaded "${newAsset.name}" to Cloud Storage!`);
                  setTimeout(() => setUploadNotice(null), 5000);
                  setShowUploadModal(false);
                  setUploadFileName('');
                }}
              >
                Upload to Cloud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
