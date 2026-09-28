import { useState, useEffect, useRef } from 'react';
import { useLms } from '../context/LmsContext';
import {
  Upload, Image as ImageIcon, DollarSign, Clock, Award, Shield,
  Monitor, Plus, Trash2, X, CheckCircle2, FileText, Users,
  Star, Sparkles, Tag, Eye, RefreshCw, AlertCircle, Check
} from 'lucide-react';

const PRESET_THUMBNAILS = [
  { label: 'Leadership', url: '/thumbnails/leadership.jpg' },
  { label: 'Web Development', url: '/thumbnails/webdev.jpg' },
  { label: 'Customer Service', url: '/thumbnails/customer-service.jpg' },
  { label: 'Project Management', url: '/thumbnails/project-mgmt.jpg' },
  { label: 'Data Privacy', url: '/thumbnails/data-privacy.jpg' },
  { label: 'Management', url: '/thumbnails/management.jpg' },
];

const AVAILABLE_ICONS = [
  { id: 'Clock', label: 'Clock / Duration', icon: Clock },
  { id: 'Award', label: 'Certificate / Award', icon: Award },
  { id: 'Monitor', label: 'Device / Access', icon: Monitor },
  { id: 'Shield', label: 'Security / Payment', icon: Shield },
  { id: 'FileText', label: 'Resources / Files', icon: FileText },
  { id: 'Users', label: 'Community / Mentorship', icon: Users },
  { id: 'Star', label: 'Star / Quality', icon: Star },
  { id: 'Sparkles', label: 'Sparkles / AI Bonus', icon: Sparkles },
];

const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'Clock': return Clock;
    case 'Award': return Award;
    case 'Monitor': return Monitor;
    case 'Shield': return Shield;
    case 'FileText': return FileText;
    case 'Users': return Users;
    case 'Star': return Star;
    case 'Sparkles': return Sparkles;
    default: return CheckCircle2;
  }
};

export default function CourseLandingEditorModal({ isOpen, onClose, course, isCreateMode = false, onSaved }) {
  const { updateCourse, addCourse } = useLms();
  const fileInputRef = useRef(null);

  // Active form section tab
  const [activeTab, setActiveTab] = useState('pricing_media'); // 'pricing_media' | 'features' | 'details'

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Leadership');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Published');
  const [price, setPrice] = useState(149);
  const [isFree, setIsFree] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [pricingSubtitle, setPricingSubtitle] = useState('One-time payment • Lifetime access');
  const [duration, setDuration] = useState('12 hours');
  const [thumbnailUrl, setThumbnailUrl] = useState('/thumbnails/leadership.jpg');
  const [features, setFeatures] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');

  // Custom Perk state
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newFeatureIcon, setNewFeatureIcon] = useState('Clock');

  // URL input helper
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize or reset form when course changes or modal opens
  useEffect(() => {
    if (course && !isCreateMode) {
      setTitle(course.title || '');
      setCode(course.code || '');
      setCategory(course.category || 'Leadership');
      setDescription(course.description || '');
      setStatus(course.status || 'Published');
      setPrice(course.price !== undefined ? course.price : 149);
      setIsFree(course.price === 0);
      setCurrency(course.currency || 'USD');
      setPricingSubtitle(course.pricingSubtitle || 'One-time payment • Lifetime access');
      setDuration(course.duration || '12 hours');
      setThumbnailUrl(course.thumbnailUrl || '/thumbnails/leadership.jpg');
      setObjectives(course.objectives && course.objectives.length > 0 ? [...course.objectives] : [
        'Understand core concepts and methodologies',
        'Develop practical real-world execution skills',
        'Earn an accredited credential for your profile'
      ]);

      if (course.features && Array.isArray(course.features) && course.features.length > 0) {
        setFeatures(course.features.map(f => ({ ...f })));
      } else {
        // Default standard 4 features matching screenshot
        setFeatures([
          { id: 'feat-1', icon: 'Clock', label: `${course.duration || '12 hours'} of content`, enabled: true },
          { id: 'feat-2', icon: 'Award', label: 'Certificate of completion', enabled: true },
          { id: 'feat-3', icon: 'Monitor', label: 'Full lifetime access', enabled: true },
          { id: 'feat-4', icon: 'Shield', label: 'Secure Stripe payment', enabled: true },
        ]);
      }
    } else {
      // Create mode defaults
      setTitle('');
      setCode(`CRS-${Math.floor(100 + Math.random() * 900)}`);
      setCategory('Leadership');
      setDescription('Learn actionable frameworks and industry-tested best practices.');
      setStatus('Draft');
      setPrice(149);
      setIsFree(false);
      setCurrency('USD');
      setPricingSubtitle('One-time payment • Lifetime access');
      setDuration('12 hours');
      setThumbnailUrl('/thumbnails/leadership.jpg');
      setObjectives([
        'Understand core concepts and frameworks',
        'Gain hands-on skills with real case studies',
        'Earn an accredited completion certificate'
      ]);
      setFeatures([
        { id: 'feat-1', icon: 'Clock', label: '12 hours of content', enabled: true },
        { id: 'feat-2', icon: 'Award', label: 'Certificate of completion', enabled: true },
        { id: 'feat-3', icon: 'Monitor', label: 'Full lifetime access', enabled: true },
        { id: 'feat-4', icon: 'Shield', label: 'Secure Stripe payment', enabled: true },
      ]);
    }
    setSaveSuccess(false);
  }, [course, isCreateMode, isOpen]);

  // Handle local image upload via FileReader
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setThumbnailUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
    setFeatures(prev => prev.map(f => {
      if (f.icon === 'Clock' && f.label.includes('of content')) {
        return { ...f, label: `${newDuration} of content` };
      }
      return f;
    }));
  };

  const handleToggleFree = (checked) => {
    setIsFree(checked);
    if (checked) {
      setPrice(0);
      setPricingSubtitle('Free enrollment • Lifetime access');
    } else {
      if (price === 0) setPrice(149);
      setPricingSubtitle('One-time payment • Lifetime access');
    }
  };

  const handleToggleFeature = (id) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleUpdateFeatureLabel = (id, newLabel) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, label: newLabel } : f));
  };

  const handleDeleteFeature = (id) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    const newFeature = {
      id: `feat-${Date.now()}`,
      icon: newFeatureIcon,
      label: newFeatureText.trim(),
      enabled: true,
    };
    setFeatures(prev => [...prev, newFeature]);
    setNewFeatureText('');
  };

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setObjectives(prev => [...prev, newObjective.trim()]);
    setNewObjective('');
  };

  const handleRemoveObjective = (index) => {
    setObjectives(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      alert('Please enter a course title.');
      return;
    }

    const coursePayload = {
      title: title.trim(),
      code: code.trim(),
      category,
      description: description.trim(),
      status,
      price: isFree ? 0 : Number(price) || 0,
      currency,
      pricingSubtitle: pricingSubtitle.trim() || (isFree ? 'Free enrollment • Lifetime access' : 'One-time payment • Lifetime access'),
      duration: duration.trim() || '10 hours',
      thumbnailUrl: thumbnailUrl || '/thumbnails/leadership.jpg',
      features: features.map(f => ({
        id: f.id,
        icon: f.icon,
        label: f.label,
        enabled: f.enabled !== false,
      })),
      objectives: objectives.filter(o => o.trim().length > 0),
    };

    let targetCourseId = course?.id;

    if (isCreateMode) {
      targetCourseId = addCourse(coursePayload);
    } else if (course?.id) {
      updateCourse(course.id, coursePayload);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSaved) onSaved(targetCourseId);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const displayPriceString = isFree || Number(price) === 0 ? 'Free' : `${currencySymbol}${Number(price).toFixed(2)}`;
  const activeFeatures = features.filter(f => f.enabled !== false);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 99999 }}>
      <div
        className="modal-dialog modal-lg"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 960,
          width: '94vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 40px rgba(6,182,212,0.25)',
          border: '1px solid rgba(6, 182, 212, 0.4)'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--cyan), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Tag size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                {isCreateMode ? 'Create New Course' : `Edit Landing & Pricing: ${course?.title || 'Course'}`}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                Manage course thumbnail banner, pricing, access model, and highlight perks
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: 'var(--border-subtle)',
          background: 'rgba(10, 24, 37, 0.6)',
          padding: '0 24px'
        }}>
          {[
            { id: 'pricing_media', label: 'Media & Pricing', icon: DollarSign },
            { id: 'features', label: 'Landing Perks & Highlights', icon: Award },
            { id: 'details', label: 'Course Overview & Objectives', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 600,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body: 2 Columns (Form Left, Live Card Preview Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 340px',
          gap: 24,
          padding: 24,
          overflowY: 'auto',
          flex: 1,
          minHeight: 0
        }}>
          {/* Left Column: Form Controls */}
          <div>
            {/* TAB 1: Media & Pricing */}
            {activeTab === 'pricing_media' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Thumbnail Image Upload */}
                <div className="glass-card-static" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ImageIcon size={16} style={{ color: 'var(--cyan)' }} /> Course Thumbnail / Banner Image
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        Displayed at top of pricing card, catalog, and dashboard
                      </p>
                    </div>
                    {thumbnailUrl && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--rose)', fontSize: 11 }}
                        onClick={() => setThumbnailUrl('')}
                      >
                        <Trash2 size={12} /> Clear
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Preview & Action Buttons */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
                    <div style={{
                      width: 140,
                      height: 80,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--border-color-active)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt="Thumbnail preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ justifyContent: 'center' }}
                      >
                        <Upload size={14} /> Upload Image from Computer
                      </button>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        style={{ fontSize: 11 }}
                      >
                        {showUrlInput ? 'Hide Image URL' : 'Or paste direct Image URL'}
                      </button>
                    </div>
                  </div>

                  {/* URL Input */}
                  {showUrlInput && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="https://example.com/course-banner.jpg"
                        value={customImageUrl}
                        onChange={e => setCustomImageUrl(e.target.value)}
                        style={{ fontSize: 12, padding: '6px 10px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (customImageUrl.trim()) {
                            setThumbnailUrl(customImageUrl.trim());
                            setCustomImageUrl('');
                            setShowUrlInput(false);
                          }
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Preset Library Quick Picker */}
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      Select from library presets:
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {PRESET_THUMBNAILS.map(preset => (
                        <button
                          key={preset.url}
                          type="button"
                          className="filter-chip"
                          onClick={() => setThumbnailUrl(preset.url)}
                          style={{
                            fontSize: 11,
                            padding: '4px 8px',
                            borderColor: thumbnailUrl === preset.url ? 'var(--cyan)' : 'var(--border-subtle)',
                            background: thumbnailUrl === preset.url ? 'rgba(6,182,212,0.15)' : 'rgba(0,0,0,0.2)',
                            color: thumbnailUrl === preset.url ? 'var(--cyan)' : 'var(--text-secondary)'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Currency Configuration */}
                <div className="glass-card-static" style={{ padding: 16 }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={16} style={{ color: 'var(--emerald)' }} /> Pricing & Access Model
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    {/* Price Input */}
                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                        Course Price
                      </label>
                      <div className="input-with-icon" style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: 9, color: 'var(--text-muted)', fontSize: 14, fontWeight: 700 }}>
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isFree}
                          className="input"
                          style={{ paddingLeft: 28, fontSize: 14, fontWeight: 600 }}
                          value={isFree ? 0 : price}
                          onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Currency Selector */}
                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                        Currency
                      </label>
                      <select
                        className="select"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        style={{ fontSize: 13 }}
                      >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="AUD">AUD ($) - Australian Dollar</option>
                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                      </select>
                    </div>
                  </div>

                  {/* Free Course Toggle */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--glass-surface-light)',
                    border: 'var(--border-subtle)',
                    marginBottom: 14
                  }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Free Course</span>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                        Students can enroll instantly without Stripe checkout
                      </p>
                    </div>
                    <label className="toggle" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={e => handleToggleFree(e.target.checked)}
                      />
                      <span className="toggle-track" />
                    </label>
                  </div>

                  {/* Pricing Subtitle / Access Model */}
                  <div>
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Pricing Subtitle / Access Note
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. One-time payment • Lifetime access"
                      value={pricingSubtitle}
                      onChange={e => setPricingSubtitle(e.target.value)}
                      style={{ fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {[
                        'One-time payment • Lifetime access',
                        'Annual subscription • Cancel anytime',
                        'Free enrollment • Certificate included',
                        'Company sponsored access'
                      ].map(example => (
                        <button
                          key={example}
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize: 10, padding: '2px 6px', color: 'var(--text-muted)' }}
                          onClick={() => setPricingSubtitle(example)}
                        >
                          + {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Highlights & Perks */}
            {activeTab === 'features' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Course Duration */}
                <div className="glass-card-static" style={{ padding: 16 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} style={{ color: 'var(--cyan)' }} /> Estimated Total Duration
                  </h4>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input"
                      style={{ maxWidth: 200 }}
                      placeholder="e.g. 12 hours"
                      value={duration}
                      onChange={e => handleDurationChange(e.target.value)}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Synchronizes with the duration bullet on the pricing card
                    </span>
                  </div>
                </div>

                {/* Features List Manager */}
                <div className="glass-card-static" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={16} style={{ color: 'var(--amber)' }} /> Pricing Card Highlight Perks
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        Bullet list rendered directly under the Continue Learning / Enroll button
                      </p>
                    </div>
                  </div>

                  {/* List of existing features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {features.map((feat) => {
                      const IconComp = getIconComponent(feat.icon);
                      return (
                        <div
                          key={feat.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: feat.enabled !== false ? 'rgba(6, 182, 212, 0.05)' : 'rgba(0, 0, 0, 0.25)',
                            border: feat.enabled !== false ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                            opacity: feat.enabled !== false ? 1 : 0.5
                          }}
                        >
                          <label className="toggle" style={{ margin: 0, transform: 'scale(0.85)' }} title="Toggle on/off">
                            <input
                              type="checkbox"
                              checked={feat.enabled !== false}
                              onChange={() => handleToggleFeature(feat.id)}
                            />
                            <span className="toggle-track" />
                          </label>

                          <div style={{
                            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                            background: 'rgba(2, 132, 199, 0.12)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'var(--cyan)'
                          }}>
                            <IconComp size={15} />
                          </div>

                          <input
                            type="text"
                            className="input"
                            value={feat.label}
                            onChange={e => handleUpdateFeatureLabel(feat.id, e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                          />

                          <button
                            type="button"
                            className="btn btn-ghost btn-icon"
                            style={{ width: 28, height: 28, color: 'var(--text-muted)' }}
                            onClick={() => handleDeleteFeature(feat.id)}
                            title="Delete perk"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Feature Row */}
                  <div style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--glass-surface-light)',
                    border: '1px dashed var(--border-color-active)'
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                      + Add New Highlight Perk
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        className="select"
                        value={newFeatureIcon}
                        onChange={e => setNewFeatureIcon(e.target.value)}
                        style={{ width: 140, fontSize: 12, padding: '6px 8px' }}
                      >
                        {AVAILABLE_ICONS.map(i => (
                          <option key={i.id} value={i.id}>{i.label}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. 15 Downloadable Cheatsheets"
                        value={newFeatureText}
                        onChange={e => setNewFeatureText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                        style={{ flex: 1, fontSize: 12, padding: '6px 10px' }}
                      />

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAddFeature}
                        disabled={!newFeatureText.trim()}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Course Overview & Objectives */}
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="glass-card-static" style={{ padding: 16 }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Basic Information
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        Course Title *
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Leadership Fundamentals"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                          Course Code
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. LEAD-101"
                          value={code}
                          onChange={e => setCode(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                          Category
                        </label>
                        <select
                          className="select"
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                        >
                          <option value="Leadership">Leadership</option>
                          <option value="Customer Support">Customer Support</option>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="Project Management">Project Management</option>
                          <option value="Cybersecurity">Cybersecurity & Compliance</option>
                          <option value="Product Strategy">Product Strategy</option>
                          <option value="Business Operations">Business Operations</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        Course Description
                      </label>
                      <textarea
                        className="textarea"
                        rows={3}
                        placeholder="Comprehensive overview of the course curriculum..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                        Status
                      </label>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {['Published', 'Draft', 'Archived'].map(st => (
                          <label key={st} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="courseStatus"
                              checked={status === st}
                              onChange={() => setStatus(st)}
                            />
                            {st}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                <div className="glass-card-static" style={{ padding: 16 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    What You'll Learn (Objectives)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {objectives.map((obj, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, flex: 1, color: 'var(--text-secondary)' }}>{obj}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          style={{ width: 24, height: 24, color: 'var(--text-muted)' }}
                          onClick={() => handleRemoveObjective(idx)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Add an objective (e.g. Master strategic decision frameworks)..."
                      value={newObjective}
                      onChange={e => setNewObjective(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddObjective(); } }}
                      style={{ fontSize: 12, padding: '6px 10px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddObjective}
                      disabled={!newObjective.trim()}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Exact Live Learner Preview Card matching screenshot */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Live Learner View
              </span>
              <span className="badge badge-published" style={{ fontSize: 10 }}>
                Real-Time Preview
              </span>
            </div>

            {/* THE PRICING CARD (Identical to CourseDetail.jsx & User Screenshot) */}
            <div className="glass-card-static" style={{
              border: '1px solid rgba(2, 132, 199, 0.35)',
              boxShadow: 'var(--shadow-xl)',
              padding: 0,
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--glass-surface-elevated)'
            }}>
              {/* Banner Image */}
              {thumbnailUrl ? (
                <div style={{ height: 170, position: 'relative', overflow: 'hidden', background: 'var(--bg-deep)' }}>
                  <img
                    src={thumbnailUrl}
                    alt={title || 'Course Thumbnail'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5, 14, 20, 0.05) 0%, rgba(7, 21, 32, 0.95) 100%)'
                  }} />
                </div>
              ) : (
                <div style={{
                  height: 120,
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <ImageIcon size={32} />
                </div>
              )}

              <div style={{ padding: 22 }}>
                {/* Price Display */}
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                  <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: -0.5 }}>
                    {displayPriceString}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {pricingSubtitle || 'One-time payment • Lifetime access'}
                  </div>
                </div>

                {/* Continue Learning / Action Button */}
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #0284c7 0%, #1fbbd2 100%)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(31, 187, 210, 0.38)',
                    cursor: 'default',
                    color: '#ffffff'
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: '9px solid white',
                    marginRight: 2
                  }} />
                  Continue Learning
                </button>

                {/* Features Highlights List */}
                <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeFeatures.map((item, i) => {
                    const IconC = getIconComponent(item.icon);
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          fontSize: 13,
                          color: '#94a3b8'
                        }}
                      >
                        <IconC size={16} style={{ color: '#64748b', flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.4 }}>{item.label}</span>
                      </div>
                    );
                  })}
                  {activeFeatures.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: 8 }}>
                      No features selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: 10, background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--cyan)', lineHeight: 1.4 }}>
                💡 Any changes made to price, thumbnail, duration, or perks update this card instantly across the student portal and course landing page.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{
          padding: '14px 24px',
          borderTop: 'var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {saveSuccess && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Course saved successfully!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saveSuccess}
              style={{ minWidth: 140 }}
            >
              <Check size={16} /> {isCreateMode ? 'Create Course' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
