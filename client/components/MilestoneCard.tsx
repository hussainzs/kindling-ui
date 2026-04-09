import { Check, Trash2 } from 'lucide-react';

type MilestoneCardTone = 'rose' | 'gold' | 'sage';

type MilestoneCardProps = {
  text: string;
  tone: MilestoneCardTone;
  tilt: number;
  onDelete: () => void;
  actionType?: 'delete' | 'complete';
};

export default function MilestoneCard({
  text,
  tone,
  tilt,
  onDelete,
  actionType = 'delete',
}: MilestoneCardProps) {
  const actionLabel =
    actionType === 'complete' ? 'Mark milestone complete' : 'Delete milestone';

  return (
    <article
      className={`milestone-card milestone-card-${tone}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-label={`Milestone: ${text}`}
    >
      <div className="milestone-card-actions">
        <button
          type="button"
          className={`milestone-card-delete-btn ${
            actionType === 'complete' ? 'milestone-card-complete-btn' : ''
          }`}
          onClick={onDelete}
          aria-label={actionLabel}
        >
          {actionType === 'complete' ? (
            <Check className="icon icon-sm" />
          ) : (
            <Trash2 className="icon icon-sm" />
          )}
        </button>
      </div>

      <span
        className={`milestone-card-pin milestone-card-pin-${tone}`}
        aria-hidden="true"
      />
      <p className="milestone-card-text text-note-hand">{text}</p>
    </article>
  );
}
