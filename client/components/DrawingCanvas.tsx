import { useEffect, useRef, useState } from 'react';
import type { DrawingColor, DrawingStroke } from '../types/drawing';

interface DrawingCanvasProps {
  initialStrokes?: DrawingStroke[];
  onSave?: (strokes: DrawingStroke[]) => void;
  onDone?: () => void;
  isFullScreen?: boolean;
  showDoneButton?: boolean;
}

const COLOR_MAP: Record<DrawingColor, string> = {
  black: '#000000',
  rust: '#b8431f',
  gold: '#c9973a',
  sage: '#5e8060',
};

export default function DrawingCanvas({
  initialStrokes = [],
  onSave,
  onDone,
  isFullScreen = false,
  showDoneButton = false,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState<DrawingColor>('black');
  const [isEraser, setIsEraser] = useState(false);
  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialStrokes);

  // Initialize canvas and redraw
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.isEraser) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  };

  const handlePointerLeave = () => {
    setIsDrawing(false);
  };

  const handleDone = () => {
    if (onSave) {
      onSave(strokes);
    }
    if (onDone) {
      onDone();
    }
  };

  if (isFullScreen) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 bg-white"
        style={{
          paddingTop: `max(var(--space-4), var(--safe-top))`,
          paddingRight: `max(var(--space-4), var(--safe-right))`,
          paddingBottom: `max(var(--space-4), var(--safe-bottom))`,
          paddingLeft: `max(var(--space-4), var(--safe-left))`,
          zIndex: 30,
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="w-full h-full touch-manipulation bg-white"
          style={{ touchAction: 'none' }}
        />

        {/* Toolbar */}
        <div className="fixed bottom-4 left-4 right-4 z-50 flex gap-2 flex-wrap justify-center">
          {/* Color buttons */}
          <button
            type="button"
            onClick={() => {
              setCurrentColor('black');
              setIsEraser(false);
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              currentColor === 'black' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#000000',
            }}
            aria-label="Black color"
          />

          <button
            type="button"
            onClick={() => {
              setCurrentColor('rust');
              setIsEraser(false);
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              currentColor === 'rust' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#b8431f',
            }}
            aria-label="Rust color"
          />

          <button
            type="button"
            onClick={() => {
              setCurrentColor('gold');
              setIsEraser(false);
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              currentColor === 'gold' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#c9973a',
            }}
            aria-label="Gold color"
          />

          <button
            type="button"
            onClick={() => {
              setCurrentColor('sage');
              setIsEraser(false);
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              currentColor === 'sage' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#5e8060',
            }}
            aria-label="Sage color"
          />

          {/* Eraser toggle */}
          <div className="w-px bg-divider" />

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isEraser
                ? 'bg-black text-white'
                : 'bg-warm-white text-text-ink-mid border border-divider'
            }`}
            aria-label="Eraser tool"
            aria-pressed={isEraser}
          >
            ✕ Erase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="w-full bg-white rounded-lg border border-divider overflow-hidden"
        style={{ height: '400px' }}
      >
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

      {/* Toolbar for embedded mode */}
      <div className="flex gap-2 p-3 bg-parchment border border-divider rounded-lg flex-wrap justify-between items-center">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentColor('black');
              setIsEraser(false);
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === 'black' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#000000',
            }}
            aria-label="Black color"
          />

          <button
            type="button"
            onClick={() => {
              setCurrentColor('rust');
              setIsEraser(false);
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === 'rust' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#b8431f',
            }}
            aria-label="Rust color"
          />

          <button
            type="button"
            onClick={() => {
              setCurrentColor('gold');
              setIsEraser(false);
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === 'gold' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#c9973a',
            }}
            aria-label="Gold color"
          />

          <button
            type="button"
            onClick={() => {
              setCurrentColor('sage');
              setIsEraser(false);
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === 'sage' && !isEraser
                ? 'border-black scale-110'
                : 'border-transparent'
            }`}
            style={{
              backgroundColor: '#5e8060',
            }}
            aria-label="Sage color"
          />

          <div className="w-px bg-divider" />

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isEraser
                ? 'bg-black text-white'
                : 'bg-warm-white text-text-ink-mid border border-divider'
            }`}
            aria-label="Eraser tool"
            aria-pressed={isEraser}
          >
            ✕
          </button>
        </div>

        {showDoneButton && (
          <button type="button" className="btn btn-primary" onClick={handleDone}>
            done →
          </button>
        )}
      </div>
    </div>
  );
}