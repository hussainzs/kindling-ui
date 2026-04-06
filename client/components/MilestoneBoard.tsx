import MilestoneCard from './MilestoneCard';
import MilestoneDraftInput from './MilestoneDraftInput';

type MilestoneBoardProps = {
  milestones: string[];
  draftMilestone: string;
  onDraftChange: (value: string) => void;
  onAddMilestone: () => void;
  onIgnoreDraft: () => void;
  onDeleteMilestone: (index: number) => void;
};

const NOTE_VARIANTS: Array<{ tone: 'rose' | 'gold' | 'sage'; tilt: number }> = [
  { tone: 'rose', tilt: -1.8 },
  { tone: 'gold', tilt: 2.2 },
  { tone: 'sage', tilt: -1.4 },
  { tone: 'gold', tilt: 1.2 },
  { tone: 'rose', tilt: -0.9 },
];

export default function MilestoneBoard({
  milestones,
  draftMilestone,
  onDraftChange,
  onAddMilestone,
  onIgnoreDraft,
  onDeleteMilestone,
}: MilestoneBoardProps) {
  return (
    <aside className="notebook-right-column" aria-label="Milestone board">
      <div className="milestone-board-canvas">
        <h2 className="text-caption notebook-milestone-title">your milestones</h2>

        {milestones.length ? (
          <div className="milestone-card-grid" aria-label="Committed milestones">
            {milestones.map((milestone, index) => {
              const style = NOTE_VARIANTS[index % NOTE_VARIANTS.length];

              return (
                <MilestoneCard
                  key={`${milestone}-${index}`}
                  text={milestone}
                  tone={style.tone}
                  tilt={style.tilt}
                  onDelete={() => onDeleteMilestone(index)}
                />
              );
            })}
          </div>
        ) : (
          <p className="milestone-board-empty text-caption">
            add a milestone below and it will pin here.
          </p>
        )}
      </div>

      <MilestoneDraftInput
        draftMilestone={draftMilestone}
        onDraftChange={onDraftChange}
        onAddMilestone={onAddMilestone}
        onIgnoreDraft={onIgnoreDraft}
      />
    </aside>
  );
}