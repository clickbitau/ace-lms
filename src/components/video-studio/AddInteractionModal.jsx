import { useState, useEffect } from 'react';
import {
  X, Info, GitFork, HelpCircle, MapPin, Clock, Plus, Trash2,
  Check, ExternalLink, BookOpen, Crosshair, Sparkles
} from 'lucide-react';

export default function AddInteractionModal({
  isOpen,
  onClose,
  onSave,
  currentTime = 0,
  duration = 0,
  interactionToEdit = null,
  capturedCoords = null,
  onStartCoordPick
}) {
  const [type, setType] = useState('hotspot'); // 'hotspot' | 'branching' | 'quiz'

  // Common fields
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [triggerTime, setTriggerTime] = useState(0);

  // Hotspot specific
  const [coordX, setCoordX] = useState(50);
  const [coordY, setCoordY] = useState(50);
  const [action, setAction] = useState('info'); // 'info' | 'link' | 'pause'
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');

  // Branching specific
  const [description, setDescription] = useState('');
  const [branchOptions, setBranchOptions] = useState([
    { id: 'opt-1', label: 'Option A: Continue Exploring', jumpTo: 30, description: '' },
    { id: 'opt-2', label: 'Option B: Jump to Advanced Concepts', jumpTo: 60, description: '' }
  ]);

  // Quiz specific
  const [question, setQuestion] = useState('');
  const [quizChoices, setQuizChoices] = useState([
    { id: 'q-1', text: 'First answer choice', isCorrect: true },
    { id: 'q-2', text: 'Second answer choice', isCorrect: false }
  ]);
  const [correctFeedback, setCorrectFeedback] = useState('Correct! You got it right.');
  const [incorrectFeedback, setIncorrectFeedback] = useState('Not quite right. Review the lesson and try again.');

  const [validationError, setValidationError] = useState('');

  // Populate form when editing or initializing
  useEffect(() => {
    if (interactionToEdit) {
      setType(interactionToEdit.type || 'hotspot');
      setTitle(interactionToEdit.title || '');

      if (interactionToEdit.type === 'hotspot') {
        setStartTime(interactionToEdit.startTime ?? Math.floor(currentTime));
        setEndTime(interactionToEdit.endTime ?? Math.min(duration || 1000, Math.floor(currentTime) + 10));
        setCoordX(interactionToEdit.x ?? 50);
        setCoordY(interactionToEdit.y ?? 50);
        setAction(interactionToEdit.action || 'info');
        setContent(interactionToEdit.content || '');
        setUrl(interactionToEdit.url || '');
      } else if (interactionToEdit.type === 'branching') {
        setTriggerTime(interactionToEdit.triggerTime ?? Math.floor(currentTime));
        setDescription(interactionToEdit.description || '');
        setBranchOptions(
          interactionToEdit.options?.length > 0
            ? interactionToEdit.options
            : [
                { id: 'opt-1', label: 'Option A: Lab Session', jumpTo: 45, description: '' },
                { id: 'opt-2', label: 'Option B: Case Study', jumpTo: 90, description: '' }
              ]
        );
      } else if (interactionToEdit.type === 'quiz') {
        setTriggerTime(interactionToEdit.triggerTime ?? Math.floor(currentTime));
        setQuestion(interactionToEdit.question || '');
        setQuizChoices(
          interactionToEdit.choices?.length > 0
            ? interactionToEdit.choices
            : [
                { id: 'q-1', text: 'Option 1', isCorrect: true },
                { id: 'q-2', text: 'Option 2', isCorrect: false }
              ]
        );
        setCorrectFeedback(interactionToEdit.feedback?.correct || 'Correct! Great job.');
        setIncorrectFeedback(interactionToEdit.feedback?.incorrect || 'Not quite right.');
      }
    } else {
      // Default new interaction state based on current time
      const cur = Math.floor(currentTime);
      setStartTime(cur);
      setEndTime(Math.min(duration || 1000, cur + 8));
      setTriggerTime(cur);
      setTitle('');
      setContent('');
      setUrl('');
      setDescription('');
      setQuestion('');
      setCoordX(capturedCoords?.x ?? 50);
      setCoordY(capturedCoords?.y ?? 50);
    }
    setValidationError('');
  }, [interactionToEdit, isOpen, currentTime, duration]);

  // Update coordinates if captured from video click
  useEffect(() => {
    if (capturedCoords) {
      setCoordX(capturedCoords.x);
      setCoordY(capturedCoords.y);
    }
  }, [capturedCoords]);

  if (!isOpen) return null;

  // Add / Remove branch options
  const handleAddBranchOption = () => {
    if (branchOptions.length >= 4) return;
    const newId = `opt-${Date.now()}`;
    const nextLetter = String.fromCharCode(65 + branchOptions.length);
    setBranchOptions([
      ...branchOptions,
      {
        id: newId,
        label: `Option ${nextLetter}: Next Chapter`,
        jumpTo: Math.min(duration || 1000, triggerTime + 30),
        description: ''
      }
    ]);
  };

  const handleRemoveBranchOption = (id) => {
    if (branchOptions.length <= 2) {
      setValidationError('A branching decision must have at least 2 choices');
      return;
    }
    setBranchOptions(branchOptions.filter((o) => o.id !== id));
  };

  const handleUpdateBranchOption = (id, field, value) => {
    setBranchOptions(
      branchOptions.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  // Add / Remove quiz choices
  const handleAddQuizChoice = () => {
    if (quizChoices.length >= 5) return;
    const newId = `q-${Date.now()}`;
    setQuizChoices([
      ...quizChoices,
      { id: newId, text: '', isCorrect: false }
    ]);
  };

  const handleRemoveQuizChoice = (id) => {
    if (quizChoices.length <= 2) {
      setValidationError('A quiz must have at least 2 choices');
      return;
    }
    setQuizChoices(quizChoices.filter((c) => c.id !== id));
  };

  const handleSetCorrectChoice = (id) => {
    setQuizChoices(
      quizChoices.map((c) => ({
        ...c,
        isCorrect: c.id === id
      }))
    );
  };

  const handleUpdateChoiceText = (id, text) => {
    setQuizChoices(
      quizChoices.map((c) => (c.id === id ? { ...c, text } : c))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (type === 'hotspot') {
      if (!title.trim()) {
        setValidationError('Please provide a title for the hotspot');
        return;
      }
      if (startTime >= endTime) {
        setValidationError('End time must be greater than start time');
        return;
      }

      onSave({
        id: interactionToEdit?.id || `hotspot-${Date.now()}`,
        type: 'hotspot',
        title: title.trim(),
        startTime: parseFloat(startTime),
        endTime: parseFloat(endTime),
        x: parseFloat(coordX),
        y: parseFloat(coordY),
        action,
        content: content.trim(),
        url: url.trim()
      });
    } else if (type === 'branching') {
      if (!title.trim()) {
        setValidationError('Please provide a decision prompt title');
        return;
      }
      if (branchOptions.length < 2) {
        setValidationError('Please provide at least 2 branch choices');
        return;
      }

      onSave({
        id: interactionToEdit?.id || `branch-${Date.now()}`,
        type: 'branching',
        title: title.trim(),
        description: description.trim(),
        triggerTime: parseFloat(triggerTime),
        options: branchOptions.map((o) => ({
          ...o,
          jumpTo: parseFloat(o.jumpTo)
        }))
      });
    } else if (type === 'quiz') {
      if (!question.trim()) {
        setValidationError('Please enter a question');
        return;
      }
      if (quizChoices.some((c) => !c.text.trim())) {
        setValidationError('All choice options must have text');
        return;
      }
      if (!quizChoices.some((c) => c.isCorrect)) {
        setValidationError('Please mark at least one option as the correct answer');
        return;
      }

      onSave({
        id: interactionToEdit?.id || `quiz-${Date.now()}`,
        type: 'quiz',
        title: title.trim() || 'Checkpoint Quiz',
        question: question.trim(),
        triggerTime: parseFloat(triggerTime),
        choices: quizChoices,
        feedback: {
          correct: correctFeedback.trim() || 'Correct!',
          incorrect: incorrectFeedback.trim() || 'Incorrect.'
        }
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal ivs-add-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="ivs-modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>
                {interactionToEdit ? 'Edit Interaction' : 'Add New Interaction'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Configure interactive timecode, position, and action rules
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Interaction Type Selector Tabs (Only changeable when creating new) */}
            {!interactionToEdit && (
              <div className="ivs-type-selector">
                <button
                  type="button"
                  className={`ivs-type-btn ${type === 'hotspot' ? 'active type-hotspot' : ''}`}
                  onClick={() => setType('hotspot')}
                >
                  <MapPin size={16} />
                  <span>Clickable Hotspot</span>
                </button>

                <button
                  type="button"
                  className={`ivs-type-btn ${type === 'branching' ? 'active type-branch' : ''}`}
                  onClick={() => setType('branching')}
                >
                  <GitFork size={16} />
                  <span>Branching Decision</span>
                </button>

                <button
                  type="button"
                  className={`ivs-type-btn ${type === 'quiz' ? 'active type-quiz' : ''}`}
                  onClick={() => setType('quiz')}
                >
                  <HelpCircle size={16} />
                  <span>In-Video Quiz</span>
                </button>
              </div>
            )}

            {validationError && (
              <div className="ivs-modal-error">
                <Info size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {/* ════════ HOTSPOT FIELDS ════════ */}
            {type === 'hotspot' && (
              <>
                <div>
                  <label className="ivs-field-label">Hotspot Title / Banner Text</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Click to inspect component hierarchy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label className="ivs-field-label" style={{ margin: 0 }}>Start Time (seconds)</label>
                      <button
                        type="button"
                        className="btn-text-tiny"
                        onClick={() => setStartTime(Math.floor(currentTime))}
                      >
                        Use Current ({Math.floor(currentTime)}s)
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label className="ivs-field-label" style={{ margin: 0 }}>End Time (seconds)</label>
                      <button
                        type="button"
                        className="btn-text-tiny"
                        onClick={() => setEndTime(parseFloat(startTime) + 8)}
                      >
                        +8s duration
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Percentage Coordinates Picker */}
                <div className="ivs-coords-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Hotspot Position (% of video frame)
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onStartCoordPick?.()}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      <Crosshair size={13} /> Click Video to Pick
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span className="tiny-label">Horizontal (X %): {coordX}%</span>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="0.5"
                        value={coordX}
                        onChange={(e) => setCoordX(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <span className="tiny-label">Vertical (Y %): {coordY}%</span>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="0.5"
                        value={coordY}
                        onChange={(e) => setCoordY(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Type */}
                <div>
                  <label className="ivs-field-label">Action Behavior when Clicked</label>
                  <div className="ivs-action-radios">
                    <label className={`ivs-action-pill ${action === 'info' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="action"
                        value="info"
                        checked={action === 'info'}
                        onChange={() => setAction('info')}
                      />
                      <Info size={14} /> Display Info Card
                    </label>

                    <label className={`ivs-action-pill ${action === 'link' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="action"
                        value="link"
                        checked={action === 'link'}
                        onChange={() => setAction('link')}
                      />
                      <ExternalLink size={14} /> Open External Link
                    </label>

                    <label className={`ivs-action-pill ${action === 'pause' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="action"
                        value="pause"
                        checked={action === 'pause'}
                        onChange={() => setAction('pause')}
                      />
                      <BookOpen size={14} /> Pause &amp; Read Tooltip
                    </label>
                  </div>
                </div>

                {/* Action Content or URL */}
                {action === 'link' ? (
                  <div>
                    <label className="ivs-field-label">Destination URL</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://example.com/documentation"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="ivs-field-label">Card Description / Content</label>
                    <textarea
                      className="textarea"
                      rows={3}
                      placeholder="Provide helpful context, notes, or tips for the viewer..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* ════════ BRANCHING DECISION FIELDS ════════ */}
            {type === 'branching' && (
              <>
                <div>
                  <label className="ivs-field-label">Decision Prompt / Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Choose your next learning track"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="ivs-field-label" style={{ margin: 0 }}>Trigger Timecode (seconds)</label>
                    <button
                      type="button"
                      className="btn-text-tiny"
                      onClick={() => setTriggerTime(Math.floor(currentTime))}
                    >
                      Use Current ({Math.floor(currentTime)}s)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={triggerTime}
                    onChange={(e) => setTriggerTime(e.target.value)}
                    required
                  />
                  <span className="helper-text">
                    The video will automatically pause when playback reaches this timestamp.
                  </span>
                </div>

                <div>
                  <label className="ivs-field-label">Description / Subtitle (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Pick a path based on your experience level"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Branch Choices */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="ivs-field-label" style={{ margin: 0 }}>
                      Branch Choices ({branchOptions.length} of 4)
                    </label>
                    {branchOptions.length < 4 && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleAddBranchOption}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        <Plus size={13} /> Add Option
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {branchOptions.map((opt, idx) => (
                      <div key={opt.id} className="ivs-branch-item-card">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="branch-key-badge">{String.fromCharCode(65 + idx)}</span>
                          <input
                            type="text"
                            className="input"
                            style={{ flex: 2 }}
                            placeholder="Option Label (e.g., Go to Laboratory)"
                            value={opt.label}
                            onChange={(e) => handleUpdateBranchOption(opt.id, 'label', e.target.value)}
                            required
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JumpTo:</span>
                            <input
                              type="number"
                              min="0"
                              className="input"
                              style={{ width: '80px' }}
                              value={opt.jumpTo}
                              onChange={(e) => handleUpdateBranchOption(opt.id, 'jumpTo', e.target.value)}
                              required
                            />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>s</span>
                          </div>
                          {branchOptions.length > 2 && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm text-red"
                              onClick={() => handleRemoveBranchOption(opt.id)}
                              style={{ padding: '6px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ════════ IN-VIDEO QUIZ FIELDS ════════ */}
            {type === 'quiz' && (
              <>
                <div>
                  <label className="ivs-field-label">Checkpoint Title (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Module 2 Comprehension Check"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="ivs-field-label" style={{ margin: 0 }}>Trigger Timecode (seconds)</label>
                    <button
                      type="button"
                      className="btn-text-tiny"
                      onClick={() => setTriggerTime(Math.floor(currentTime))}
                    >
                      Use Current ({Math.floor(currentTime)}s)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={triggerTime}
                    onChange={(e) => setTriggerTime(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="ivs-field-label">Question Text</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    placeholder="e.g., Which hook is used for memoizing calculated values in React?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>

                {/* Multiple Choice Answers */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="ivs-field-label" style={{ margin: 0 }}>
                      Answer Choices (Select the green radio for the correct answer)
                    </label>
                    {quizChoices.length < 5 && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleAddQuizChoice}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        <Plus size={13} /> Add Choice
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quizChoices.map((choice, idx) => (
                      <div key={choice.id} className="ivs-quiz-choice-edit-row">
                        <label className="choice-radio-wrap" title="Mark as correct answer">
                          <input
                            type="radio"
                            name="correctChoice"
                            checked={choice.isCorrect}
                            onChange={() => handleSetCorrectChoice(choice.id)}
                          />
                          <span className="choice-radio-custom" />
                        </label>
                        <span className="choice-idx">{String.fromCharCode(65 + idx)}.</span>
                        <input
                          type="text"
                          className="input"
                          placeholder={`Answer option ${String.fromCharCode(65 + idx)}`}
                          value={choice.text}
                          onChange={(e) => handleUpdateChoiceText(choice.id, e.target.value)}
                          required
                        />
                        {quizChoices.length > 2 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm text-red"
                            onClick={() => handleRemoveQuizChoice(choice.id)}
                            style={{ padding: '6px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="ivs-field-label">Correct Feedback Text</label>
                    <input
                      type="text"
                      className="input"
                      value={correctFeedback}
                      onChange={(e) => setCorrectFeedback(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="ivs-field-label">Incorrect Feedback Text</label>
                    <input
                      type="text"
                      className="input"
                      value={incorrectFeedback}
                      onChange={(e) => setIncorrectFeedback(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              {interactionToEdit ? 'Save Changes' : 'Add to Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
