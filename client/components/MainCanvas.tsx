import { useEffect, useRef, useState } from 'react';
import type { DrawingColor, DrawingStroke } from '../types/drawing';

interface MainCanvasProps {
  initialStrokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  currentColor: DrawingColor;
  isEraser: boolean;
}

const COLOR_MAP: Record<DrawingColor, string> = {
  black: '#000000',
  rust: '#b8431f',
  gold: '#c9973a',
  sage: '#5e8060',
};

export default function MainCanvas({
  initialStrokes,
  onStrokesChange,
  currentColor,
  isEraser,
}: MainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialStrokes);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = COLOR_MAP[stroke.color];
      }

      ctx.lineWidth = stroke.isEraser ? 20 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }

        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas();
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  const getPointerCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getPointerCoords(e);
    if (!coords) return;

    const newStroke: DrawingStroke = {
      points: [coords],
      color: currentColor,
      isEraser,
    };

    setStrokes([...strokes, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getPointerCoords(e);
    if (!coords) return;

    setStrokes((prevStrokes) => {
      const newStrokes = [...prevStrokes];
      const lastStroke = newStrokes[newStrokes.length - 1];
      if (lastStroke) {
        lastStroke.points.push(coords);
      }
      return newStrokes;
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    onStrokesChange(strokes);
  };

  const handlePointerLeave = () => {
    setIsDrawing(false);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full touch-manipulation"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
