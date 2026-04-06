import { Trash2 } from 'lucide-react';

type MilestoneCardTone = 'rose' | 'gold' | 'sage';

type MilestoneCardProps = {
  text: string;
  tone: MilestoneCardTone;
  tilt: number;
  onDelete: () => void;
};

export default function MilestoneCard({
  text,
  tone,
  tilt,
  onDelete,
}: MilestoneCardProps) {
  return (
    <article
      className={`milestone-card milestone-card-${tone}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-label={`Milestone: ${text}`}
    >
      <div className="milestone-card-actions">
        <button
          type="button"
          className="milestone-card-delete-btn"
          onClick={onDelete}
          aria-label="Delete milestone"
        >
          <Trash2 className="icon icon-sm" />
        </button>
      </div>

      <span className={`milestone-card-pin milestone-card-pin-${tone}`} aria-hidden="true" />
      <p className="milestone-card-text text-note-hand">{text}</p>
    </article>
  );
}