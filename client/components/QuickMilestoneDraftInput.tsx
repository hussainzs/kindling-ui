import { useEffect, useRef } from 'react';
import { CornerDownLeft } from 'lucide-react';

type QuickMilestoneDraftInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function QuickMilestoneDraftInput({
  value,
  onChange,
  onSubmit,
}: QuickMilestoneDraftInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <section
      className="quick-milestone-input-shell"
      aria-label="Quick milestone input"
    >
      <label
        className="text-caption milestone-draft-label"
        htmlFor="quick-milestone-input"
      >
        milestone idea
      </label>

      <div className="quick-milestone-input-row">
        <textarea
          ref={textareaRef}
          id="quick-milestone-input"
          className="milestone-draft-input text-note-hand quick-milestone-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="+ add milestone"
          rows={1}
          aria-label="Draft milestone"
        />

        <button
          type="button"
          className="btn btn-primary quick-milestone-submit"
          onClick={onSubmit}
          aria-label="Add milestone"
        >
          <CornerDownLeft className="icon icon-sm" />
        </button>
      </div>
    </section>
  );
}
