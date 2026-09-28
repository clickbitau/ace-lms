import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

/**
 * QuizOverlay
 * Pauses video and shows an interactive multiple-choice question.
 * Provides immediate feedback on answer selection and resumes playback upon continuation.
 */
export default function QuizOverlay({
  interaction,
  onResumeVideo,
  onDismiss,
  isEditor = false
}) {
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    question = 'Knowledge Check Question',
    choices = [],
    feedback = {
      correct: 'Correct! Great job understanding this concept.',
      incorrect: 'Not quite. Review this section carefully before continuing.'
    }
  } = interaction;

  const selectedChoice = choices.find((c) => c.id === selectedChoiceId);
  const isCorrect = selectedChoice?.isCorrect === true;

  const handleSubmit = (e) => {
    e.stopPropagation();
    if (!selectedChoiceId) return;
    setSubmitted(true);
  };

  const handleContinue = (e) => {
    e.stopPropagation();
    onResumeVideo?.();
  };

  const handleRetry = (e) => {
    e.stopPropagation();
    setSubmitted(false);
    setSelectedChoiceId(null);
  };

  return (
    <div
      className="ivs-quiz-backdrop"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ivs-quiz-card">
        {/* Educational Header Ribbon */}
        <div className="ivs-quiz-header">
          <div className="ivs-quiz-badge">
            <HelpCircle size={15} />
            <span>KNOWLEDGE CHECKPOINT</span>
          </div>
          {interaction.triggerTime !== undefined && (
            <div className="ivs-quiz-time-pill">
              <span>Paused at {Math.floor(interaction.triggerTime / 60).toString().padStart(2, '0')}:{(Math.floor(interaction.triggerTime) % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
          {isEditor && (
            <span className="badge badge-published" style={{ fontSize: '10px' }}>
              Quiz Node
            </span>
          )}
        </div>

        {/* Question Text */}
        <h3 className="ivs-quiz-question">{question}</h3>

        {/* Multiple Choice Options */}
        <div className="ivs-quiz-choices">
          {choices.map((choice, idx) => {
            const isSelected = selectedChoiceId === choice.id;
            let choiceStatusClass = '';

            if (submitted) {
              if (choice.isCorrect) {
                choiceStatusClass = 'is-correct';
              } else if (isSelected && !choice.isCorrect) {
                choiceStatusClass = 'is-wrong';
              }
            } else if (isSelected) {
              choiceStatusClass = 'is-selected';
            }

            return (
              <button
                key={choice.id || idx}
                type="button"
                disabled={submitted}
                className={`ivs-quiz-choice-btn ${choiceStatusClass}`}
                onClick={() => setSelectedChoiceId(choice.id)}
              >
                <div className="ivs-choice-indicator">
                  {submitted && choice.isCorrect ? (
                    <CheckCircle2 size={18} className="text-emerald" />
                  ) : submitted && isSelected && !choice.isCorrect ? (
                    <XCircle size={18} className="text-red" />
                  ) : (
                    <span className="ivs-choice-letter">{String.fromCharCode(65 + idx)}</span>
                  )}
                </div>
                <span className="ivs-choice-text">{choice.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section once submitted */}
        {submitted && (
          <div className={`ivs-quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            <div className="ivs-feedback-icon">
              {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            </div>
            <div className="ivs-feedback-content">
              <strong>{isCorrect ? 'Correct! Outstanding Work' : 'Incorrect — Review Concept'}</strong>
              <p>{isCorrect ? feedback.correct : feedback.incorrect}</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="ivs-quiz-footer">
          {!submitted ? (
            <button
              type="button"
              className="btn btn-primary ivs-quiz-submit-btn"
              disabled={!selectedChoiceId}
              onClick={handleSubmit}
            >
              Submit Answer
            </button>
          ) : (
            <div className="ivs-quiz-actions-row">
              {!isCorrect && (
                <button
                  type="button"
                  className="btn btn-secondary ivs-quiz-retry-btn"
                  onClick={handleRetry}
                >
                  <RotateCcw size={15} /> Try Again
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary ivs-quiz-continue-btn"
                onClick={handleContinue}
              >
                Continue Lecture <ArrowRight size={15} />
              </button>
            </div>
          )}

          {isEditor && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onDismiss}
                style={{ fontSize: '11px', color: 'var(--text-muted)' }}
              >
                Dismiss Quiz in Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
