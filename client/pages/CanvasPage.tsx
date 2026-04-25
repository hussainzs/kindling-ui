import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import MainCanvas from '../components/MainCanvas';
import ColorPicker from '../components/ColorPicker';
import SaveArtworkModal from '../components/SaveArtworkModal';
import type { DrawingColor, DrawingStroke } from '../types/drawing';
import { Brush, Eraser, Save } from 'lucide-react';
import type { WorkflowOutletContext } from '../components/WorkflowLayout';

const ACTIVE_CANVAS_KEY = 'kindling_active_canvas_strokes';
const RESET_CANVAS_KEY = 'kindling_canvas_should_reset';
const CANVAS_SESSION_START_KEY = 'kindling_canvas_session_start';
const CANVAS_ELAPSED_KEY = 'kindling_canvas_elapsed_ms';
const CANVAS_PROJECT_ID_KEY = 'kindling_canvas_project_id';

const parseDurationToMs = (duration: string): number => {
  if (!duration || duration === '--') return 0;
  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)\s*min/);
  const h = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const m = minsMatch ? parseInt(minsMatch[1]) : 0;
  return (h * 60 + m) * 60000;
};

export default function CanvasPage() {
  const navigate = useNavigate();
  const {
    setCanvasStrokes,
    milestones,
    milestonesCompleted,
    resumedArtworkId,
  } = useOutletContext<WorkflowOutletContext>();

  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [currentColor, setCurrentColor] = useState<DrawingColor>('black');
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const colorToggleButtonRef = useRef<HTMLButtonElement>(null);

  const fullBleedCanvasStyle = {
    width: '100dvw',
    marginLeft: 'calc(50% - 50dvw)',
    marginTop: 'calc(-1 * max(var(--space-4), var(--safe-top)))',
  } as const;

  // Initialize canvas + start timer in one effect so elapsed seeding
  // always happens before the session start timestamp is recorded
  useEffect(() => {
    const shouldReset = sessionStorage.getItem(RESET_CANVAS_KEY) === '1';
    sessionStorage.removeItem(RESET_CANVAS_KEY);

    if (!shouldReset) {
      const storedStrokes = sessionStorage.getItem(ACTIVE_CANVAS_KEY);
      const storedId = sessionStorage.getItem(CANVAS_PROJECT_ID_KEY);

      if (storedStrokes && storedId) {
        try {
          const parsed = JSON.parse(storedStrokes) as DrawingStroke[];
          setStrokes(parsed);
          setProjectId(storedId);
          setCanvasStrokes(parsed);

          // Seed banked time from the saved artwork's duration when resuming,
          // but only if there's no banked time already (i.e. a mid-session refresh
          // should not re-seed and double-count)
          if (!sessionStorage.getItem(CANVAS_ELAPSED_KEY)) {
            const savedArtworks = JSON.parse(
              sessionStorage.getItem('kindling_saved_artworks') ?? '[]'
            ) as Array<{ id: string; duration?: string }>;
            const match = savedArtworks.find((a) => a.id === storedId);
            if (match?.duration) {
              sessionStorage.setItem(
                CANVAS_ELAPSED_KEY,
                String(parseDurationToMs(match.duration))
              );
            }
          }

          // Start timer AFTER seeding elapsed time
          sessionStorage.setItem(CANVAS_SESSION_START_KEY, String(Date.now()));

          return () => {
            const start = Number(sessionStorage.getItem(CANVAS_SESSION_START_KEY));
            if (start) {
              const prev = Number(sessionStorage.getItem(CANVAS_ELAPSED_KEY) ?? '0');
              sessionStorage.setItem(CANVAS_ELAPSED_KEY, String(prev + (Date.now() - start)));
              sessionStorage.removeItem(CANVAS_SESSION_START_KEY);
            }
          };
        } catch {
          // Invalid stored data, fall through to fresh canvas
        }
      }
    }

    // Fresh canvas — clear any stale timer keys from a previous project
    sessionStorage.removeItem(CANVAS_ELAPSED_KEY);
    sessionStorage.removeItem(CANVAS_SESSION_START_KEY);

    const newId = `project_${Date.now()}`;
    let initialStrokes: DrawingStroke[] = [];

    const storedThumbnailStrokes = sessionStorage.getItem(
      'kindling_selected_thumbnail_strokes'
    );
    if (storedThumbnailStrokes) {
      try {
        initialStrokes = JSON.parse(storedThumbnailStrokes);
      } catch {
        // Invalid data
      }
    }

    setProjectId(newId);
    setStrokes(initialStrokes);
    setCanvasStrokes(initialStrokes);
    sessionStorage.setItem(CANVAS_PROJECT_ID_KEY, newId);
    sessionStorage.setItem(ACTIVE_CANVAS_KEY, JSON.stringify(initialStrokes));

    // Start timer for fresh canvas
    sessionStorage.setItem(CANVAS_SESSION_START_KEY, String(Date.now()));

    return () => {
      const start = Number(sessionStorage.getItem(CANVAS_SESSION_START_KEY));
      if (start) {
        const prev = Number(sessionStorage.getItem(CANVAS_ELAPSED_KEY) ?? '0');
        sessionStorage.setItem(CANVAS_ELAPSED_KEY, String(prev + (Date.now() - start)));
        sessionStorage.removeItem(CANVAS_SESSION_START_KEY);
      }
    };
  }, [setCanvasStrokes]);

  const handleStrokesChange = (newStrokes: DrawingStroke[]) => {
    setStrokes(newStrokes);
    setCanvasStrokes(newStrokes);
    sessionStorage.setItem(ACTIVE_CANVAS_KEY, JSON.stringify(newStrokes));
  };

  const getElapsedDuration = (): string => {
    const start = Number(sessionStorage.getItem(CANVAS_SESSION_START_KEY) ?? '0');
    const banked = Number(sessionStorage.getItem(CANVAS_ELAPSED_KEY) ?? '0');
    const totalMs = banked + (start ? Date.now() - start : 0);
    if (totalMs < 60000) return '< 1 min';
    const totalMin = Math.round(totalMs / 60000);
    if (totalMin < 60) return `${totalMin} min`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const clearTimerKeys = () => {
    sessionStorage.removeItem(CANVAS_SESSION_START_KEY);
    sessionStorage.removeItem(CANVAS_ELAPSED_KEY);
  };

  const buildThumbnail = (allStrokes: DrawingStroke[]) => {
    const COLOR_MAP: Record<string, string> = {
      black: '#000000',
      rust: '#b8431f',
      gold: '#c9973a',
      sage: '#5e8060',
    };

    const W = 600;
    const H = 450;

    // Draw strokes on a transparent canvas
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = W;
    drawingCanvas.height = H;
    const drawingCtx = drawingCanvas.getContext('2d')!;

    allStrokes.forEach((stroke) => {
      drawingCtx.globalCompositeOperation = stroke.isEraser
        ? 'destination-out'
        : 'source-over';
      drawingCtx.strokeStyle = COLOR_MAP[stroke.color] ?? '#000';
      drawingCtx.lineWidth = stroke.isEraser ? 20 : 2;
      drawingCtx.lineCap = 'round';
      drawingCtx.lineJoin = 'round';
      if (stroke.points.length > 0) {
        drawingCtx.beginPath();
        drawingCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach((p) => drawingCtx.lineTo(p.x, p.y));
        drawingCtx.stroke();
      }
    });

    // Compute bounding box of non-eraser stroke points
    const inkStrokes = allStrokes.filter((s) => !s.isEraser);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    inkStrokes.forEach((stroke) => {
      stroke.points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });

    const hasInk = inkStrokes.length > 0 && minX !== Infinity;
    const PADDING = 40;
    const cropX = hasInk ? Math.max(0, minX - PADDING) : 0;
    const cropY = hasInk ? Math.max(0, minY - PADDING) : 0;
    const cropW = hasInk ? Math.min(W - cropX, maxX - minX + PADDING * 2) : W;
    const cropH = hasInk ? Math.min(H - cropY, maxY - minY + PADDING * 2) : H;

    // Composite cropped region onto a solid white background
    const offscreen = document.createElement('canvas');
    offscreen.width = cropW;
    offscreen.height = cropH;
    const ctx = offscreen.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cropW, cropH);
    ctx.drawImage(drawingCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return offscreen.toDataURL('image/png');
  };

  const handleSaveToGallery = (payload: {
    title: string;
    description: string;
    tags: string;
  }) => {
    const { title, description, tags } = payload;
    const thumbnail = buildThumbnail(strokes);

    const newArtwork = {
      id: projectId,
      title,
      description,
      folderId: 'all',
      tag: tags.trim() || 'canvas',
      duration: getElapsedDuration(),
      progress: `${milestonesCompleted.length}/${milestones.length + milestonesCompleted.length} goals`,
      tone: 'abstract' as const,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: thumbnail,
    };

    const existing = JSON.parse(
      sessionStorage.getItem('kindling_saved_artworks') ?? '[]'
    );
    const deduped = existing.filter((a: { id: string }) => a.id !== projectId);
    sessionStorage.setItem(
      'kindling_saved_artworks',
      JSON.stringify([newArtwork, ...deduped])
    );

    clearTimerKeys();
    navigate('/');
  };

  const handleSaveNewClick = () => {
    setShowSaveModal(true);
  };

  const isSaveEnabled = Boolean(resumedArtworkId && projectId === resumedArtworkId);

  const handleSaveExisting = () => {
    if (!isSaveEnabled) return;

    const thumbnail = buildThumbnail(strokes);
    const stored = JSON.parse(
      sessionStorage.getItem('kindling_saved_artworks') ?? '[]'
    ) as Array<Record<string, unknown>>;

    const updated = stored.map((artwork) => {
      if (artwork.id !== projectId) return artwork;
      return {
        ...artwork,
        image: thumbnail,
        duration: getElapsedDuration(),
        progress: `${milestonesCompleted.length}/${milestones.length + milestonesCompleted.length} goals`,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };
    });

    sessionStorage.setItem('kindling_saved_artworks', JSON.stringify(updated));
    sessionStorage.setItem(
      'kindling_gallery_toast_message',
      'latest canvas updated and saved'
    );

    clearTimerKeys();
    navigate('/');
  };

  return (
    <div
      className="canvas-app min-h-[100svh] flex flex-col bg-black overflow-hidden"
      style={fullBleedCanvasStyle}
    >
      {/* Top Toolbar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 gap-4 flex-shrink-0">
        <div className="w-24" />

        <div className="flex-1 text-center">
          <h2 className="text-white font-semibold text-sm">Canvas</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/thumbnail')}
            className="bg-gray-800 !text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            thumbnails
          </button>
          <button
            type="button"
            className="btn bg-sage !text-white text-sm font-semibold rounded-lg transition-colors"
            onClick={handleSaveExisting}
            disabled={!isSaveEnabled}
            style={{
              opacity: isSaveEnabled ? 1 : 0.25,
              cursor: isSaveEnabled ? 'pointer' : 'not-allowed',
            }}
          >
            <Save className="icon icon-sm" />
            save
          </button>
          <button
            onClick={handleSaveNewClick}
            className="bg-rust !text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            save new ✦
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 gap-2 flex-shrink-0">
          <button
            onClick={() => setIsEraser(false)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              !isEraser ? 'bg-orange-800 text-white' : 'text-white hover:bg-gray-800'
            }`}
            title="Brush"
          >
            <Brush size={24} color="white" />
          </button>

          <button
            onClick={() => setIsEraser(true)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              isEraser ? 'bg-orange-800 text-white' : 'text-white hover:bg-gray-800'
            }`}
            title="Eraser"
          >
            <Eraser size={24} color="white" />
          </button>

          <div className="w-8 h-px bg-gray-800" />

          <button
            ref={colorToggleButtonRef}
            onClick={() => setShowColorPicker((isOpen) => !isOpen)}
            className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
            title="Color"
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white"
              style={{
                backgroundColor:
                  currentColor === 'black'
                    ? '#000000'
                    : currentColor === 'rust'
                      ? '#b8431f'
                      : currentColor === 'gold'
                        ? '#c9973a'
                        : '#5e8060',
              }}
            />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-950 relative overflow-hidden">
          <MainCanvas
            key={projectId}
            initialStrokes={strokes}
            onStrokesChange={handleStrokesChange}
            currentColor={currentColor}
            isEraser={isEraser}
          />
        </div>

        {/* Color Picker */}
        <div className="absolute top-3 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <ColorPicker
              currentColor={currentColor}
              onColorChange={(color) => {
                setCurrentColor(color);
                setIsEraser(false);
              }}
              isOpen={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              triggerRef={colorToggleButtonRef}
            />
          </div>
        </div>
      </div>

      {/* Check-in Button */}
      <button
        onClick={() => navigate('/check-in')}
        className="fixed bottom-6 right-6 px-6 py-3 bg-rust !text-white rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-lg"
      >
        check-in
      </button>

      {showSaveModal && (
        <SaveArtworkModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={(payload) => {
            handleSaveToGallery({ ...payload, tags: 'canvas' });
            setShowSaveModal(false);
          }}
        />
      )}
    </div>
  );
}
