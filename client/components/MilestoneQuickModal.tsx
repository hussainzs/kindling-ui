import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import MilestoneCard from './MilestoneCard';
import QuickMilestoneDraftInput from './QuickMilestoneDraftInput';

const NOTE_VARIANTS: Array<{ tone: 'rose' | 'gold' | 'sage'; tilt: number }> = [
  { tone: 'rose', tilt: -0.8 },
  { tone: 'gold', tilt: 1.1 },
  { tone: 'sage', tilt: -0.6 },
  { tone: 'gold', tilt: 0.7 },
  { tone: 'rose', tilt: -0.4 },
];

type MilestoneQuickModalProps = {
  isOpen: boolean;
  milestones: string[];
  onClose: () => void;
  onAddMilestone: (milestone: string) => void;
  onCompleteMilestone: (index: number) => void;
};

export default function MilestoneQuickModal({
  isOpen,
  milestones,
  onClose,
  onAddMilestone,
  onCompleteMilestone,
}: MilestoneQuickModalProps) {
  const [draftMilestone, setDraftMilestone] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleAddMilestone = () => {
    const normalizedMilestone = draftMilestone.trim();
    if (!normalizedMilestone) {
      return;
    }

    onAddMilestone(normalizedMilestone);
    setDraftMilestone('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close quick milestones"
        className="overlay quick-milestones-overlay"
        onClick={onClose}
      />

      <section
        className="surface-sheet quick-milestones-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Quick milestones"
      >
        <header className="quick-milestones-header">
          <h2 className="text-caption quick-milestones-title">quick milestones</h2>
          <button
            type="button"
            className="btn btn-ghost quick-milestones-close"
            onClick={onClose}
            aria-label="Close quick milestones"
          >
            <X className="icon" />
          </button>
        </header>

        {milestones.length ? (
          <div className="milestone-card-grid quick-milestones-grid" aria-label="Current milestones">
            {milestones.map((milestone, index) => {
              const style = NOTE_VARIANTS[index % NOTE_VARIANTS.length];

              return (
                <MilestoneCard
                  key={`${milestone}-${index}`}
                  text={milestone}
                  tone={style.tone}
                  tilt={style.tilt}
                  actionType="complete"
                  onDelete={() => onCompleteMilestone(index)}
                />
              );
            })}
          </div>
        ) : (
          <p className="milestone-board-empty text-caption quick-milestones-empty">
            no milestones yet. add one below.
          </p>
        )}

        <QuickMilestoneDraftInput
          value={draftMilestone}
          onChange={setDraftMilestone}
          onSubmit={handleAddMilestone}
        />
      </section>
    </>
  );
}
