import { useState } from 'react';

const DEFAULT_NOTE_PROMPT = 'what are you here to make today?';

export default function NotebookInputSurface() {
  const [draftText, setDraftText] = useState('');
  const [scrollTop, setScrollTop] = useState(0);

  return (
    <div className="notebook-input-shell">
      <p
        className="notebook-input-default text-note-hand"
        style={{ transform: `translateY(${-scrollTop}px)` }}
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
