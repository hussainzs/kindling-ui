import { useEffect, useState } from 'react';

const DEFAULT_NOTE_PROMPT = 'what are you here to make today?';
const NOTE_SYNC_DELAY_MS = 220;

type NotebookInputSurfaceProps = {
  initialText: string;
  onStableTextChange: (value: string) => void;
};

export default function NotebookInputSurface({
  initialText,
  onStableTextChange,
}: NotebookInputSurfaceProps) {
  const [draftText, setDraftText] = useState(initialText);
  const [scrollTop, setScrollTop] = useState(0);
  const showDefaultPrompt = draftText.trim().length === 0;

  useEffect(() => {
    setDraftText(initialText);
  }, [initialText]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onStableTextChange(draftText);
    }, NOTE_SYNC_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftText, onStableTextChange]);

  return (
    <div className="notebook-input-shell">
      <p
        className="notebook-input-default text-note-hand"
        style={{
          transform: `translateY(${-scrollTop}px)`,
          opacity: showDefaultPrompt ? 1 : 0,
        }}
        aria-hidden="true"
      >
        {DEFAULT_NOTE_PROMPT}
      </p>

      <textarea
        value={draftText}
        onChange={(event) => setDraftText(event.target.value)}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        className="notebook-input notebook-input-entry text-note-hand notebook-input-active"
        aria-label="Notebook writing area"
        spellCheck={false}
      />
    </div>
  );
}
