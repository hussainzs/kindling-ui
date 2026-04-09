import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import MainCanvas from '../components/MainCanvas';
import type {
  Layer,
  DrawingColor,
  DrawingStroke,
  CanvasProject,
} from '../types/drawing';
import { Eye, EyeOff, Trash2, Brush, Eraser } from 'lucide-react';
import { useOutletContext } from 'react-router';
import type { WorkflowOutletContext } from '../components/WorkflowLayout';

export default function CanvasPage() {
  const navigate = useNavigate();
  const [project, setProject] = useState<CanvasProject | null>(null);
  const [currentColor, setCurrentColor] = useState<DrawingColor>('black');
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const projectId = `project_${Date.now()}`;
    const thumbnailStrokes: DrawingStroke[] = [];

    const storedThumbnailStrokes = sessionStorage.getItem(
      'kindling_selected_thumbnail_strokes'
    );
    if (storedThumbnailStrokes) {
      try {
        const strokes = JSON.parse(storedThumbnailStrokes);
        thumbnailStrokes.push(...strokes);
      } catch {
        // Invalid data
      }
    }

    const baseLayer: Layer = {
      id: `layer_${Date.now()}`,
      name: 'Layer 1',
      strokes: thumbnailStrokes,
      opacity: 100,
      isVisible: true,
      createdAt: Date.now(),
    };

    const newProject: CanvasProject = {
      id: projectId,
      layers: [baseLayer],
      activeLayerId: baseLayer.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProject(newProject);
    sessionStorage.setItem(
      `kindling_project_${projectId}`,
      JSON.stringify(newProject)
    );
  }, []);

  const handleSelectLayer = (layerId: string) => {
    if (project) {
      const updated = { ...project, activeLayerId: layerId };
      setProject(updated);
      sessionStorage.setItem(
        `kindling_project_${project.id}`,
        JSON.stringify(updated)
      );
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    if (project) {
      const updated = {
        ...project,
        layers: project.layers.map((layer) =>
          layer.id === layerId
            ? { ...layer, isVisible: !layer.isVisible }
            : layer
        ),
        updatedAt: Date.now(),
      };
      setProject(updated);
      sessionStorage.setItem(
        `kindling_project_${project.id}`,
        JSON.stringify(updated)
      );
    }
  };

  const handleDeleteLayer = (layerId: string) => {
    if (project && project.layers.length > 1) {
      const updated = {
        ...project,
        layers: project.layers.filter((layer) => layer.id !== layerId),
        activeLayerId:
          project.activeLayerId === layerId
            ? project.layers[0].id
            : project.activeLayerId,
        updatedAt: Date.now(),
      };
      setProject(updated);
      sessionStorage.setItem(
        `kindling_project_${project.id}`,
        JSON.stringify(updated)
      );
    }
  };

  const handleCreateLayer = () => {
    if (project) {
      const newLayer: Layer = {
        id: `layer_${Date.now()}`,
        name: `Layer ${project.layers.length + 1}`,
        strokes: [],
        opacity: 100,
        isVisible: true,
        createdAt: Date.now(),
      };

      const updated = {
        ...project,
        layers: [newLayer, ...project.layers],
        activeLayerId: newLayer.id,
        updatedAt: Date.now(),
      };
      setProject(updated);
      sessionStorage.setItem(
        `kindling_project_${project.id}`,
        JSON.stringify(updated)
      );
    }
  };

  const { setCanvasStrokes } = useOutletContext<WorkflowOutletContext>();

  const handleStrokesChange = (strokes: DrawingStroke[]) => {
    if (project) {
      const updated = {
        ...project,
        layers: project.layers.map((layer) =>
          layer.id === project.activeLayerId ? { ...layer, strokes } : layer
        ),
        updatedAt: Date.now(),
      };
      setProject(updated);
      sessionStorage.setItem(
        `kindling_project_${project.id}`,
        JSON.stringify(updated)
      );

      // Sync active layer's strokes up to WorkflowLayout
      setCanvasStrokes(strokes);
    }
  };

  if (!project) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const activeLayer = project.layers.find(
    (l) => l.id === project.activeLayerId
  );

  const handleSaveToGallery = () => {
    if (!project) return;

    const allStrokes = project.layers
      .filter((l) => l.isVisible)
      .flatMap((l) => l.strokes);

    // Render to an offscreen canvas for the thumbnail
    const offscreen = document.createElement('canvas');
    offscreen.width = 600;
    offscreen.height = 450;
    const ctx = offscreen.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    const COLOR_MAP: Record<string, string> = {
      black: '#000000',
      rust: '#b8431f',
      gold: '#c9973a',
      sage: '#5e8060',
    };

    allStrokes.forEach((stroke) => {
      ctx.globalCompositeOperation = stroke.isEraser
        ? 'destination-out'
        : 'source-over';
      ctx.strokeStyle = COLOR_MAP[stroke.color] ?? '#000';
      ctx.lineWidth = stroke.isEraser ? 20 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (stroke.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    const thumbnail = offscreen.toDataURL('image/png');

    const newArtwork = {
      id: project.id,
      title: 'Untitled',
      description: 'Saved from canvas.',
      folderId: 'all',
      tag: 'canvas',
      duration: '—',
      progress: '—',
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
    // Avoid duplicates if saved twice
    const deduped = existing.filter((a: { id: string }) => a.id !== project.id);
    sessionStorage.setItem('kindling_saved_artworks', JSON.stringify([newArtwork, ...deduped]));

    navigate('/');
  };

  return (
    <div className="canvas-app w-screen h-screen flex flex-col bg-black overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 gap-4 flex-shrink-0">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/thumbnail')}
            className="bg-rust !text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            ← gallery
          </button>
        </div>

        {/* Center - Canvas Name */}
        <div className="flex-1 text-center">
          <h2 className="text-white font-semibold text-sm">Canvas</h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button className="text-white text-lg p-2 hover:bg-gray-800 rounded transition-colors">
            ↻
          </button>
          <button
            onClick={handleSaveToGallery}
            className="bg-rust !text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            save ✦
          </button>
        </div>
      </div>

      {/* Main Content - Fixed layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 gap-2 overflow-y-auto flex-shrink-0">
          {/* Brush Tool */}
          <button
            onClick={() => {
              setIsEraser(false);
            }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              !isEraser
                ? 'bg-orange-800 text-white'
                : 'text-white hover:bg-gray-800'
            }`}
            title="Brush"
          >
            <Brush size={24} color="white" />
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              isEraser
                ? 'bg-orange-800 text-white'
                : 'text-white hover:bg-gray-800'
            }`}
            title="Eraser"
          >
            <Eraser size={24} color="white" />
          </button>

          <div className="w-8 h-px bg-gray-800" />

          {/* Color Picker */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
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

          <div className="w-8 h-px bg-gray-800" />

          {/* Layers Menu */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            title="Layers"
          >
            <Eraser size={24} />
          </button>
        </div>

        {/* Canvas Area - Keep this fixed and stable */}
        <div className="flex-1 bg-gray-950 relative overflow-hidden flex-shrink-0">
          {activeLayer && (
            <MainCanvas
              key={activeLayer.id}
              initialStrokes={activeLayer.strokes}
              onStrokesChange={handleStrokesChange}
              currentColor={currentColor}
              isEraser={isEraser}
            />
          )}
        </div>

        {/* Overlay Panels Container - Positioned absolutely */}
        <div className="absolute top-14 right-0 bottom-0 pointer-events-none">
          {/* Right Sidebar - Layers Panel */}
          {showLayerMenu && (
            <div className="absolute top-0 right-0 bottom-0 w-64 bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
                <h3 className="text-white font-semibold text-sm">Layers</h3>
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="text-white hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* New Layer Button */}
              <div className="p-3 border-b border-gray-800 flex-shrink-0">
                <button
                  onClick={handleCreateLayer}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  + New Layer
                </button>
              </div>

              {/* Layers List */}
              <div className="flex-1 overflow-y-auto">
                {project.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-3 border-b border-gray-800 cursor-pointer transition-colors ${
                      project.activeLayerId === layer.id
                        ? 'bg-gray-800'
                        : 'hover:bg-gray-800 bg-gray-900'
                    }`}
                    onClick={() => handleSelectLayer(layer.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-700 rounded border border-gray-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {layer.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {layer.opacity}%
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(layer.id);
                        }}
                        className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                      >
                        {layer.isVisible ? (
                          <Eye size={16} className="text-white" />
                        ) : (
                          <EyeOff size={16} className="text-gray-500" />
                        )}
                      </button>
                      {project.layers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLayer(layer.id);
                          }}
                          className="p-1 hover:bg-red-900 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2
                            size={16}
                            className="text-white hover:text-red-400"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Sidebar - Color Picker */}
          {showColorPicker && (
            <div className="absolute top-0 right-0 bottom-0 w-64 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto flex flex-col gap-4 pointer-events-auto">
              <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="text-white font-semibold text-sm">Color</h3>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="text-white hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-white text-xs mb-2">Presets</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        ['black', '#000000'],
                        ['rust', '#b8431f'],
                        ['gold', '#c9973a'],
                        ['sage', '#5e8060'],
                      ] as [DrawingColor, string][]
                    ).map(([name, hex]) => (
                      <button
                        key={name}
                        onClick={() => {
                          setCurrentColor(name);
                          setIsEraser(false);
                        }}
                        className={`w-full aspect-square rounded-lg border-2 transition-all ${
                          currentColor === name
                            ? 'border-white'
                            : 'border-gray-700'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right - Check-in Button */}
      <button className="fixed bottom-6 right-6 px-6 py-3 bg-rust !text-white rounded-full font-bold hover:bg-opacity-90 transition-colors shadow-lg">
        check-in
      </button>
    </div>
  );
}
