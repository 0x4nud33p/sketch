// types.ts
export type ShapeType = 'pencil' | 'circle' | 'rectangle';

export interface Point {
  x: number;
  y: number;
}

export interface BaseDrawing {
  color: string;
  id?: string;
}

export interface PencilDrawing extends BaseDrawing {
  type: 'pencil';
  points: Point[];
}

export interface RectangleDrawing extends BaseDrawing {
  type: 'rectangle';
  startPoint: Point;
  width: number;
  height: number;
}

export interface CircleDrawing extends BaseDrawing {
  type: 'circle';
  center: Point;
  radius: number;
}

export type Drawing = PencilDrawing | RectangleDrawing | CircleDrawing;

export interface WSMessage {
  type: string;
  room: string;
  drawingData?: Drawing;
  data?: Drawing[];
}

export interface ControlsProps {
  onShapeSelect: (shape: ShapeType) => void;
  onClear: () => void;
  selectedShape: ShapeType;
  onColorChange: (color: string) => void;
  currentColor: string;
}

// DrawingRenderer.ts - Separate drawing logic
export class DrawingRenderer {
  static draw(ctx: CanvasRenderingContext2D, drawing: Drawing): void {
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = 2;
    
    switch (drawing.type) {
      case 'pencil':
        if (drawing.points.length < 1) return;
        
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        
        drawing.points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        
        ctx.stroke();
        break;
        
      case 'rectangle':
        ctx.beginPath();
        ctx.strokeRect(
          drawing.startPoint.x,
          drawing.startPoint.y,
          drawing.width,
          drawing.height
        );
        break;
        
      case 'circle':
        ctx.beginPath();
        ctx.arc(
          drawing.center.x,
          drawing.center.y,
          drawing.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        break;
    }
  }
}