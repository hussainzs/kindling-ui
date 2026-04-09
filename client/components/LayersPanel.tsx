import type { Layer } from '../types/drawing';
import { Eye, EyeOff, X, Plus } from 'lucide-react';
import React from 'react';
import { useRef, useEffect } from 'react';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onCreateLayer: () => void;
}

export default function LayersPanel({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onCreateLayer,
}: LayersPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* Add Layer Button */}
      <div className="p-2 border-b border-gray-700">
        <button
          type="button"
          onClick={onCreateLayer}
          className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={14} /> add
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {layers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isActive={activeLayerId === layer.id}
              onSelect={() => onSelectLayer(layer.id)}
              onToggleVisibility={() => onToggleVisibility(layer.id)}
              onDelete={() => onDeleteLayer(layer.id)}
              canDelete={layers.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

function LayerItem({
  layer,
  isActive,
  onSelect,
  onToggleVisibility,
  onDelete,
  canDelete,
}: LayerItemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 56;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const COLOR_MAP: Record<string, string> = {
      black: '#000000',
      rust: '#b8431f',
      gold: '#c9973a',
      sage: '#5e8060',
    };

    const scaleX = size / window.innerWidth;
    const scaleY = size / window.innerHeight;

    layer.strokes.forEach((stroke) => {
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
        ctx.moveTo(stroke.points[0].x * scaleX, stroke.points[0].y * scaleY);

        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x * scaleX, stroke.points[i].y * scaleY);
        }

        ctx.stroke();
      }
    });
  }, [layer]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-2 p-1.5 rounded transition-all ${
        isActive
          ? 'bg-gray-700 border-l-2 border-rust'
          : 'hover:bg-gray-800 opacity-70 hover:opacity-100'
      }`}
    >
      {/* Thumbnail */}
      <canvas
        ref={canvasRef}
        className="w-10 h-10 rounded border border-gray-600 bg-white flex-shrink-0"
      />

      {/* Layer Info */}
      <div className="flex-1 text-left min-w-0 hidden sm:block">
        <p className="text-xs font-semibold text-white truncate">
          {layer.name}
        </p>
      </div>

      {/* Visibility Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
      >
        {layer.isVisible ? (
          <Eye size={14} className="text-gray-300" />
        ) : (
          <EyeOff size={14} className="text-gray-600" />
        )}
      </button>

      {/* Delete Button */}
      {canDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-rust hover:text-white rounded transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </button>
  );
}
