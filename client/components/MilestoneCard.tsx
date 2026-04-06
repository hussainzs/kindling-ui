import { Check, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type MilestoneCardTone = 'rose' | 'gold' | 'sage';

type MilestoneCardProps = {
  text: string;
  tone: MilestoneCardTone;
  tilt: number;
  onDelete: () => void;
};

const LONG_PRESS_MS = 450;
const MOVE_CANCEL_THRESHOLD_PX = 8;

export default function MilestoneCard({
  text,
  tone,
  tilt,
  onDelete,
}: MilestoneCardProps) {
  const [showDeleteAction, setShowDeleteAction] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showDeleteAction) {
      return;
    }

    const dismissOnOutsidePointer = (event: PointerEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) {
        return;
      }

      if (cardRef.current?.contains(targetNode)) {
        return;
      }

      setShowDeleteAction(false);
    };

    window.addEventListener('pointerdown', dismissOnOutsidePointer);
    return () => {
      window.removeEventListener('pointerdown', dismissOnOutsidePointer);
    };
  }, [showDeleteAction]);

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) {
      return;
    }

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const targetNode = event.target as Node;
    const isActionButtonTap = actionsRef.current?.contains(targetNode) ?? false;

    if (showDeleteAction && !isActionButtonTap) {
      setShowDeleteAction(false);
      return;
    }

    pointerOriginRef.current = { x: event.clientX, y: event.clientY };
    clearLongPressTimer();

    longPressTimerRef.current = setTimeout(() => {
      setShowDeleteAction(true);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!pointerOriginRef.current || !longPressTimerRef.current) {
      return;
    }

    const deltaX = Math.abs(event.clientX - pointerOriginRef.current.x);
    const deltaY = Math.abs(event.clientY - pointerOriginRef.current.y);

    if (deltaX > MOVE_CANCEL_THRESHOLD_PX || deltaY > MOVE_CANCEL_THRESHOLD_PX) {
      clearLongPressTimer();
    }
  };

  const handlePointerEnd = () => {
    pointerOriginRef.current = null;
    clearLongPressTimer();
  };

  const handleDelete = () => {
    setShowDeleteAction(false);
    onDelete();
  };

  const handleCloseDeleteAction = () => {
    setShowDeleteAction(false);
  };

  return (
    <article
      ref={cardRef}
      className={`milestone-card milestone-card-${tone}`}
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-label={`Milestone: ${text}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
    >
      {showDeleteAction ? (
        <div ref={actionsRef} className="milestone-card-actions">
          <button
            type="button"
            className="milestone-card-delete-btn"
            onClick={handleDelete}
            aria-label="Delete milestone"
          >
            <Trash2 className="icon icon-sm" />
          </button>

          <button
            type="button"
            className="milestone-card-keep-btn"
            onClick={handleCloseDeleteAction}
            aria-label="Keep milestone"
          >
            <Check className="icon icon-sm" />
          </button>
        </div>
      ) : null}

      <span className={`milestone-card-pin milestone-card-pin-${tone}`} aria-hidden="true" />
      <p className="milestone-card-text text-note-hand">{text}</p>
    </article>
  );
}