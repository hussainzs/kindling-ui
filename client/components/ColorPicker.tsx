import { useRef, useEffect } from 'react';
import type { DrawingColor } from '../types/drawing';
import { Check } from 'lucide-react';
import type { RefObject } from 'react';

interface ColorPickerProps {
  currentColor: DrawingColor;
  onColorChange: (color: DrawingColor) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

const PRESET_COLORS: Record<DrawingColor, string> = {
  black: '#000000',
  rust: '#b8431f',
  gold: '#c9973a',
  sage: '#5e8060',
};

export default function ColorPicker({
  currentColor,
  onColorChange,
  isOpen,
  onClose,
  triggerRef,
}: ColorPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedPopover = popoverRef.current?.contains(target);
      const clickedTrigger = triggerRef?.current?.contains(target);

      if (
        popoverRef.current &&
        !clickedPopover &&
        !clickedTrigger
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  return (
    <div
      ref={popoverRef}
      className={`canvas-color-bar ${isOpen ? 'canvas-color-bar-open' : ''}`}
      aria-hidden={!isOpen}
      aria-label="Color picker"
    >
      {(Object.entries(PRESET_COLORS) as [DrawingColor, string][]).map(
        ([colorName, colorValue]) => (
          <button
            key={colorName}
            type="button"
            onClick={() => onColorChange(colorName)}
            className={`canvas-color-pill ${
              currentColor === colorName ? 'canvas-color-pill-active' : ''
            }`}
            style={{ backgroundColor: colorValue }}
            title={colorName}
            aria-label={`Use ${colorName} color`}
          />
        )
      )}
      <button
        type="button"
        onClick={onClose}
        className="canvas-color-close"
        aria-label="Close color picker"
      >
        <Check size={16} />
      </button>
    </div>
  );
}
