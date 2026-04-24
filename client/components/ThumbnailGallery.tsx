import type { Thumbnail } from '../types/drawing';
import StrokePreviewCanvas from './StrokePreviewCanvas';

interface ThumbnailGalleryProps {
  thumbnails: Thumbnail[];
  selectedId: string | null;
  onSelectEmpty: (slotIndex: number) => void;
  onSelectFilled: (slotIndex: number) => void;
}

const THUMBNAIL_SIZE = 200;
const MAX_THUMBNAILS = 3;

export default function ThumbnailGallery({
  thumbnails,
  selectedId,
  onSelectEmpty,
  onSelectFilled,
}: ThumbnailGalleryProps) {
  // Generate slots for all 3 positions
  const slots = Array.from({ length: MAX_THUMBNAILS }, (_, index) => {
    return { thumbnail: thumbnails[index] || null, index };
  });

  return (
    <div className="flex justify-between gap-6">
      {slots.map(({ thumbnail, index }) => (
        <div key={index} className="flex-1">
          <ThumbnailSlot
            thumbnail={thumbnail}
            slotNumber={index + 1}
            isSelected={thumbnail ? selectedId === thumbnail.id : false}
            onSelectEmpty={() => onSelectEmpty(index)}
            onSelectFilled={() => onSelectFilled(index)}
          />
        </div>
      ))}
    </div>
  );
}

interface ThumbnailSlotProps {
  thumbnail: Thumbnail | null;
  slotNumber: number;
  isSelected: boolean;
  onSelectEmpty: () => void;
  onSelectFilled: () => void;
}

function ThumbnailSlot({
  thumbnail,
  slotNumber,
  isSelected,
  onSelectEmpty,
  onSelectFilled,
}: ThumbnailSlotProps) {
  if (!thumbnail) {
    // Empty slot with dashed border - clickable to create
    return (
      <button
        type="button"
        onClick={onSelectEmpty}
        className="flex flex-col items-center gap-3 w-full transition-all hover:opacity-75"
      >
        <div
          className="rounded-lg flex items-center justify-center border-2 border-dashed hover:border-rust hover:text-rust transition-colors"
          style={{
            width: `${THUMBNAIL_SIZE}px`,
            height: `${THUMBNAIL_SIZE}px`,
            borderColor: '#8c8078',
            color: '#8c8078',
            backgroundColor: 'transparent',
          }}
        >
          ⊕
        </div>
        <span className="text-metadata text-muted uppercase">
          thumbnail {slotNumber}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelectFilled}
      className="flex flex-col items-center gap-3 w-full transition-all"
      aria-pressed={isSelected}
    >
      <div
        style={{
          width: `${THUMBNAIL_SIZE}px`,
          height: `${THUMBNAIL_SIZE}px`,
          borderRadius: 'var(--radius-lg)',
          border: isSelected
            ? '8px solid var(--accent-rust)'
            : '5px solid #ede5d8',
          padding: 0,
          transition: 'border-color 160ms ease, border-width 160ms ease',
          overflow: 'hidden',
        }}
      >
        <StrokePreviewCanvas strokes={thumbnail.strokes} size={THUMBNAIL_SIZE} />
      </div>
      <span className="text-metadata text-muted uppercase">
        thumbnail {slotNumber}
      </span>
    </button>
  );
}
