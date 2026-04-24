import { useEffect, useRef } from 'react';
import type { DrawingStroke } from '../types/drawing';

const DEFAULT_SIZE = 200;

interface StrokePreviewCanvasProps {
  strokes: DrawingStroke[];
  size?: number;
  className?: string;
}

export default function StrokePreviewCanvas({
  strokes,
  size = DEFAULT_SIZE,
  className,
}: StrokePreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    canvas.width = size;
    canvas.height = size;

    // Clear between renders so stale pixels never persist when strokes change.
    ctx.clearRect(0, 0, size, size);

    if (!strokes.length) {
      return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const COLOR_MAP: Record<string, string> = {
      black: '#000000',
      rust: '#b8431f',
      gold: '#c9973a',
      sage: '#5e8060',
    };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    strokes.forEach((stroke) => {
      stroke.points.forEach((point) => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });
    });

    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (minX !== Infinity && maxX !== -Infinity) {
      const drawingWidth = maxX - minX;
      const drawingHeight = maxY - minY;
      const padding = 10;

      scaleX = (size - padding * 2) / (drawingWidth || size);
      scaleY = (size - padding * 2) / (drawingHeight || size);

      const scale = Math.min(scaleX, scaleY, 1);
      offsetX = padding - minX * scale;
      offsetY = padding - minY * scale;
      scaleX = scale;
      scaleY = scale;
    }

    strokes.forEach((stroke) => {
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

        for (let i = 1; i < stroke.points.length; i += 1) {
          ctx.lineTo(
            stroke.points[i].x * scaleX + offsetX,
            stroke.points[i].y * scaleY + offsetY
          );
        }

        ctx.stroke();
      }
    });
  }, [size, strokes]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'block',
      }}
    />
  );
}
