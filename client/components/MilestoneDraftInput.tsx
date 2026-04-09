import { useRef } from 'react';

type MilestoneDraftInputProps = {
  draftMilestone: string;
  onDraftChange: (value: string) => void;
  onAddMilestone: () => void;
  onIgnoreDraft: () => void;
  isAttentionActive: boolean;
  statusMessage: string | null;
};

export default function MilestoneDraftInput({
  draftMilestone,
  onDraftChange,
  onAddMilestone,
  onIgnoreDraft,
  isAttentionActive,
  statusMessage,
}: MilestoneDraftInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAdd = () => {
    onAddMilestone();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <section
      className={`milestone-draft-shell ${
        isAttentionActive ? 'milestone-draft-shell-attention' : ''
      }`}
      aria-label="Milestone draft editor"
    >
      <label
        className="text-caption milestone-draft-label"
        htmlFor="milestone-draft-input"
      >
        milestone idea
      </label>

      <textarea
        ref={textareaRef}
        id="milestone-draft-input"
        className="milestone-draft-input text-note-hand"
        value={draftMilestone}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="+ add milestone"
        aria-label="Draft milestone"
      />

      <div className="milestone-draft-actions">
        <button
          type="button"
          className="btn btn-primary milestone-draft-add"
          onClick={handleAdd}
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

      {statusMessage ? (
        <p
          className="milestone-draft-status text-metadata"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
