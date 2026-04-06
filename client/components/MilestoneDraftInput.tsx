type MilestoneDraftInputProps = {
  draftMilestone: string;
  onDraftChange: (value: string) => void;
  onAddMilestone: () => void;
  onIgnoreDraft: () => void;
};

export default function MilestoneDraftInput({
  draftMilestone,
  onDraftChange,
  onAddMilestone,
  onIgnoreDraft,
}: MilestoneDraftInputProps) {
  return (
    <section className="milestone-draft-shell" aria-label="Milestone draft editor">
      <label className="text-caption milestone-draft-label" htmlFor="milestone-draft-input">
        milestone idea
      </label>

      <textarea
        id="milestone-draft-input"
        className="milestone-draft-input text-note-hand"
        value={draftMilestone}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="+ add milestone"
        aria-label="Draft milestone"
      />

      <div className="milestone-draft-actions">
        <button
          type="button"
          className="btn btn-primary milestone-draft-add"
          onClick={onAddMilestone}
        >
          add milestone
        </button>

        <button
          type="button"
          className="btn btn-ghost milestone-draft-ignore"
          onClick={onIgnoreDraft}
        >
          ignore
        </button>
      </div>
    </section>
  );
}