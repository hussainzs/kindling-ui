import { useState, useRef, useEffect } from 'react';
import type { DrawingColor } from '../types/drawing';
import { X } from 'lucide-react';
import React from 'react';

interface ColorPickerProps {
  currentColor: DrawingColor;
  onColorChange: (color: DrawingColor) => void;
  isOpen: boolean;
  onClose: () => void;
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
}: ColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 220;
    const height = 220;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 12;

    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      for (let r = 0; r < radius; r += 1) {
        const rad = (angle * Math.PI) / 180;
        const x = centerX + r * Math.cos(rad);
        const y = centerY + r * Math.sin(rad);

        const s = (r / radius) * 100;
        const color = `hsl(${angle}, ${s}%, ${lightness}%)`;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Draw selected indicator
    const selectedRad = (hue * Math.PI) / 180;
    const selectedR = (saturation / 100) * radius;
    const selectedX = centerX + selectedR * Math.cos(selectedRad);
    const selectedY = centerY + selectedR * Math.sin(selectedRad);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(selectedX, selectedY, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(selectedX, selectedY, 10, 0, Math.PI * 2);
    ctx.stroke();
  }, [hue, saturation, lightness, isOpen]);

  const handleWheelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    const angle = Math.atan2(y, x);
    const radius = Math.sqrt(x * x + y * y);
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 12;

    setHue((angle * 180) / Math.PI + 180);
    setSaturation(Math.min((radius / maxRadius) * 100, 100));
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white rounded-xl shadow-lg border border-divider z-50"
      style={{
        top: '80px',
        right: '20px',
        width: '280px',
      }}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">color</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-parchment rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Color Wheel */}
        <canvas
          ref={wheelRef}
          onClick={handleWheelClick}
          className="w-full rounded-lg cursor-crosshair"
          style={{ maxHeight: '220px' }}
        />

        {/* Lightness Slider */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-mid">
            brightness
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={lightness}
            onChange={(e) => setLightness(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted">{lightness}%</div>
        </div>

        {/* Preset Colors */}
        <div className="space-y-2 pt-2 border-t border-divider">
          <p className="text-xs font-semibold text-ink-mid">presets</p>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(PRESET_COLORS) as [DrawingColor, string][]).map(
              ([colorName, colorValue]) => (
                <button
                  key={colorName}
                  onClick={() => {
                    onColorChange(colorName);
                    onClose();
                  }}
                  className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                    currentColor === colorName
                      ? 'border-black'
                      : 'border-divider'
                  }`}
                  style={{ backgroundColor: colorValue }}
                  title={colorName}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
