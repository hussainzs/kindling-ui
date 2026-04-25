import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

type SaveArtworkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string;
  }) => void;
};

export default function SaveArtworkModal({
  isOpen,
  onClose,
  onSave,
}: SaveArtworkModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const shakeCard = () => {
    cardRef.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(0)' },
      ],
      {
        duration: 360,
        easing: 'ease-in-out',
      }
    );
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setHasAttemptedSave(true);
      shakeCard();
      return;
    }

    onSave({
      title: trimmedTitle,
      description: trimmedDescription,
    });
  };

  if (!isOpen) {
    return null;
  }

  const isTitleInvalid = hasAttemptedSave && !title.trim();
  const isDescriptionInvalid = hasAttemptedSave && !description.trim();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-4">
      <button
        type="button"
        className="overlay"
        aria-label="Close save artwork dialog"
        onClick={onClose}
      />

      <section
        ref={cardRef}
        className="surface-card relative z-[71] w-full max-w-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-artwork-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-divider px-6 py-5">
          <div>
            <h2 id="save-artwork-title" className="text-section-header">
              save new artwork
            </h2>
            <p className="mt-1 text-caption">
              Add a title and description before saving to gallery.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-compact"
            onClick={onClose}
            aria-label="Close save artwork dialog"
          >
            <X className="icon icon-sm" />
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="field-label" htmlFor="save-artwork-title-input">
              title
            </label>
            <input
              id="save-artwork-title-input"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Evening study"
              aria-invalid={isTitleInvalid}
            />
            {isTitleInvalid && (
              <p className="field-error">Please enter a title.</p>
            )}
          </div>

          <div>
            <label
              className="field-label"
              htmlFor="save-artwork-description-input"
            >
              description
            </label>
            <textarea
              id="save-artwork-description-input"
              className="textarea"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write a short description of this piece"
              aria-invalid={isDescriptionInvalid}
            />
            {isDescriptionInvalid && (
              <p className="field-error">Please enter a description.</p>
            )}
          </div>

          {/* tags removed — assigned automatically by Canvas on save */}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-divider px-6 py-5 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            save new ✦
          </button>
        </footer>
      </section>
    </div>
  );
}