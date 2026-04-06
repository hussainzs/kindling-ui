import { useRef, useEffect } from 'react';
import type { Thumbnail } from '../types/drawing';

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
            slotIndex={index}
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
  slotIndex: number;
  slotNumber: number;
  isSelected: boolean;
  onSelectEmpty: () => void;
  onSelectFilled: () => void;
}

function ThumbnailSlot({
  thumbnail,
  slotIndex,
  slotNumber,
  isSelected,
  onSelectEmpty,
  onSelectFilled,
}: ThumbnailSlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = THUMBNAIL_SIZE;
    canvas.height = THUMBNAIL_SIZE;

    // Only fill with white if there's content (thumbnail exists)
    if (thumbnail) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

      const COLOR_MAP: Record<string, string> = {
        black: '#000000',
        rust: '#b8431f',
        gold: '#c9973a',
        sage: '#5e8060',
      };

      // Calculate bounds of drawing to zoom in appropriately
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      thumbnail.strokes.forEach((stroke) => {
        stroke.points.forEach((point) => {
          minX = Math.min(minX, point.x);
          maxX = Math.max(maxX, point.x);
          minY = Math.min(minY, point.y);
          maxY = Math.max(maxY, point.y);
        });
      });

      // If we have bounds, scale to fit with padding
      let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
      
      if (minX !== Infinity && maxX !== -Infinity) {
        const drawingWidth = maxX - minX;
        const drawingHeight = maxY - minY;
        const padding = 10;
        
        scaleX = (THUMBNAIL_SIZE - padding * 2) / (drawingWidth || THUMBNAIL_SIZE);
        scaleY = (THUMBNAIL_SIZE - padding * 2) / (drawingHeight || THUMBNAIL_SIZE);
        
        const scale = Math.min(scaleX, scaleY, 1); // Don't upscale beyond 1
        
        offsetX = padding - minX * scale;
        offsetY = padding - minY * scale;
        
        scaleX = scale;
        scaleY = scale;
      }

      thumbnail.strokes.forEach((stroke) => {
        if (stroke.isEraser) {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = COLOR_MAP[stroke.color] || '#000000';
        }

        ctx.lineWidth = stroke.isEraser ? 20 * scaleX : 2 * scaleX;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (stroke.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(
            stroke.points[0].x * scaleX + offsetX,
            stroke.points[0].y * scaleY + offsetY
          );

          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(
              stroke.points[i].x * scaleX + offsetX,
              stroke.points[i].y * scaleY + offsetY
            );
          }

          ctx.stroke();
        }
      });
    }
    // If no thumbnail, canvas stays transparent
  }, [thumbnail]);

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
          border: isSelected ? '8px solid var(--accent-rust)' : '5px solid #ede5d8',
          padding: 0,
          transition: 'border-color 160ms ease, border-width 160ms ease',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: `${THUMBNAIL_SIZE}px`,
            height: `${THUMBNAIL_SIZE}px`,
            display: 'block',
          }}
        />
      </div>
      <span className="text-metadata text-muted uppercase">
        thumbnail {slotNumber}
      </span>
    </button>
  );
}