export type DrawingColor = 'black' | 'rust' | 'gold' | 'sage';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: DrawingColor;
  isEraser: boolean;
}

export interface Thumbnail {
  id: string;
  strokes: DrawingStroke[];
  createdAt: number;
}

export interface Canvas {
  strokes: DrawingStroke[];
}

export interface Layer {
  id: string;
  name: string;
  strokes: DrawingStroke[];
  opacity: number;
  isVisible: boolean;
  createdAt: number;
}

export interface CanvasProject {
  id: string;
  layers: Layer[];
  activeLayerId: string;
  createdAt: number;
  updatedAt: number;
}