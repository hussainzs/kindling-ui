import { useState } from 'react';

const DEFAULT_NOTE_PROMPT = 'what are you here to make today?';

export default function NotebookInputSurface() {
  const [draftText, setDraftText] = useState(DEFAULT_NOTE_PROMPT);
  const [isPromptMode, setIsPromptMode] = useState(true);

  const handleFocus = () => {
    if (!isPromptMode) {
      return;
    }

    setDraftText('');
    setIsPromptMode(false);
  };

  return (
    <div className="notebook-input-shell">
      <textarea
        value={draftText}
        onChange={(event) => setDraftText(event.target.value)}
        onFocus={handleFocus}
        className={`notebook-input text-note-hand ${
          isPromptMode ? 'notebook-input-prompt' : 'notebook-input-active'
        }`}
        aria-label="Notebook writing area"
        spellCheck={false}
      />
    </div>
  );
}
