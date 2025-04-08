export type ControlsProps = {
 onShapeSelect: (shape: ShapeType) => void;
 onClear: () => void;
 selectedShape: ShapeType;
 onColorChange: (color: string) => void;
 currentColor: string;
};

export type ShapeType = 'pencil' | 'circle' | 'rectangle';

export interface Point {
  x: number;
  y: number;
}

export interface Drawing {
  points?: [number, number][];
  startX?: number;
  startY?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  color: string;
}