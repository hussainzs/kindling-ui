import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Frown,
  Smile,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import type { WorkflowOutletContext } from '../components/WorkflowLayout';

export default function CheckInPage() {
  const navigate = useNavigate();
  const {
    notesSoFar,
    milestonesCompleted,
    checkInReflection,
    setCheckInReflection,
  } = useOutletContext<WorkflowOutletContext>();

  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const [isMilestoneSheetOpen, setIsMilestoneSheetOpen] = useState(false);
  const [feelingValue, setFeelingValue] = useState(0);

  const completedCountLabel = useMemo(() => {
    const completedCount = milestonesCompleted.length;
    return `${completedCount} milestone${completedCount === 1 ? '' : 's'} hit`;
  }, [milestonesCompleted.length]);

  const completedMilestonePreview = useMemo(() => {
    if (!milestonesCompleted.length) {
      return 'No milestones marked complete yet.';
    }

    return milestonesCompleted.slice(0, 2).join(' · ');
  }, [milestonesCompleted]);

  const isFrustrated = feelingValue < 50;
  const isFlowing = feelingValue >= 50;

  const onReflectionChange = (value: string) => {
    setCheckInReflection(value);
  };

  const onToggleNotes = () => {
    setIsNotesExpanded((currentValue) => !currentValue);
  };

  return (
    <section className="checkin-page-shell" aria-label="Check-in page">
      <div className="checkin-layout-split">
        <section className="checkin-left-column" aria-label="Check-in context summary">
          <header className="checkin-header-wrap checkin-header-offset">
            <h1 className="text-section-header checkin-title">how are you doing right now?</h1>
            <p className="text-caption checkin-subtitle">quickly reflect before your next move.</p>
          </header>

          <article className="surface-notebook checkin-notes-card" aria-label="Intention reminder">
            <button
              type="button"
              className="btn btn-ghost checkin-collapse-btn"
              onClick={onToggleNotes}
              aria-expanded={isNotesExpanded}
              aria-controls="checkin-notes-reminder"
            >
              {isNotesExpanded ? (
                <ChevronDown className="icon icon-sm icon-rust" />
              ) : (
                <ChevronUp className="icon icon-sm icon-rust" />
              )}
              your notes
            </button>

            <div
              id="checkin-notes-reminder"
              className={`checkin-notes-content ${isNotesExpanded ? 'checkin-notes-content-open' : 'checkin-notes-content-closed'}`}
            >
              <p className="text-note-hand checkin-notes-text">
                {notesSoFar.trim() || 'No notebook notes yet. Write in notebook to see your intention here.'}
              </p>
            </div>
          </article>

          <section className="checkin-milestone-summary" aria-label="Completed milestones summary">
            <button
              type="button"
              className="btn btn-ghost checkin-milestone-button"
              onClick={() => setIsMilestoneSheetOpen(true)}
            >
              <span className="text-label checkin-milestone-count">
                {completedCountLabel} <Star className="icon icon-sm checkin-milestone-star" />
              </span>
            </button>
            <p className="text-metadata checkin-milestone-detail">{completedMilestonePreview}</p>
          </section>
        </section>

        <section className="checkin-right-column" aria-label="Check-in reflection">
          <div className="checkin-right-stack">
            <div className="checkin-reflection-wrap">
              <label className="field-label checkin-reflection-label" htmlFor="checkin-reflection-input">
                add a note (optional)
              </label>
              <textarea
                id="checkin-reflection-input"
                className="textarea checkin-reflection-input"
                value={checkInReflection}
                onChange={(event) => onReflectionChange(event.target.value)}
                placeholder="what are you noticing right now?"
              />
            </div>

            <section className="checkin-feeling-shell" aria-label="Emotion selector">
              <p className="text-caption checkin-feeling-title">drag to where you are</p>

              <div className="checkin-feeling-row">
                <button
                  type="button"
                  className={`btn btn-ghost checkin-feeling-endpoint ${isFrustrated ? 'checkin-feeling-endpoint-active-rust' : ''}`}
                  onClick={() => setFeelingValue(0)}
                  aria-label="Set mood to frustrated"
                >
                  <Frown className="icon icon-lg" />
                </button>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={feelingValue}
                  onChange={(event) => setFeelingValue(Number(event.target.value))}
                  className="checkin-feeling-range"
                  aria-label="Current mood from frustrated to flowing"
                />

                <button
                  type="button"
                  className={`btn btn-ghost checkin-feeling-endpoint ${isFlowing ? 'checkin-feeling-endpoint-active-sage' : ''}`}
                  onClick={() => setFeelingValue(100)}
                  aria-label="Set mood to flowing"
                >
                  <Smile className="icon icon-lg" />
                </button>
              </div>

              <div className="checkin-feeling-labels">
                <p className="text-caption checkin-feeling-label-left">frustrated, not feeling it</p>
                <p className="text-caption checkin-feeling-label-right">flowing, in the zone</p>
              </div>

              {isFrustrated ? (
                <button
                  type="button"
                  className="btn btn-ghost checkin-ugly-middle-link"
                  onClick={() => navigate('/intervention')}
                >
                  this is the ugly middle
                  <ArrowRight className="icon icon-sm" />
                </button>
              ) : (
                <div className="checkin-celebration" aria-live="polite">
                  <Sparkles className="icon icon-sm icon-gold" />
                  <p className="text-caption checkin-celebration-text">flow state unlocked. keep going.</p>
                  <span className="checkin-confetti-dot checkin-confetti-dot-a" aria-hidden="true" />
                  <span className="checkin-confetti-dot checkin-confetti-dot-b" aria-hidden="true" />
                  <span className="checkin-confetti-dot checkin-confetti-dot-c" aria-hidden="true" />
                </div>
              )}
            </section>

            <div className="checkin-route-actions" aria-label="Check-in navigation actions">
              <button
                type="button"
                className="btn btn-secondary checkin-route-btn"
                onClick={() => navigate('/canvas')}
              >
                <ArrowLeft className="icon icon-sm" />
                back to canvas
              </button>

              <button
                type="button"
                className="btn btn-primary checkin-route-btn"
                onClick={() => navigate('/')}
              >
                done for today
              </button>
            </div>
          </div>
        </section>
      </div>

      {isMilestoneSheetOpen ? (
        <>
          <button
            type="button"
            className="overlay"
            aria-label="Close completed milestones"
            onClick={() => setIsMilestoneSheetOpen(false)}
          />

          <section
            className="sheet checkin-milestone-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Completed milestones"
          >
            <header className="checkin-sheet-header">
              <h2 className="text-section-header checkin-sheet-title">completed milestones</h2>
              <button
                type="button"
                className="btn btn-ghost checkin-sheet-close"
                onClick={() => setIsMilestoneSheetOpen(false)}
                aria-label="Close completed milestones"
              >
                <X className="icon icon-sm" />
              </button>
            </header>

            {milestonesCompleted.length ? (
              <ul className="checkin-sheet-list" aria-label="List of completed milestones">
                {milestonesCompleted.map((milestone, index) => (
                  <li key={`${milestone}-${index}`} className="checkin-sheet-list-item">
                    <article className="note-surface checkin-sheet-note">
                      <p className="text-note-hand checkin-sheet-note-text">{milestone}</p>
                    </article>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption checkin-sheet-empty">No milestones are marked complete yet.</p>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
