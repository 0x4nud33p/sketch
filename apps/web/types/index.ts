
export interface ControlsProps {
  onColorChange: (color: string) => void;
  currentColor: string;
  onShapeSelect: (shape: ShapeType) => void;
  selectedShape: ShapeType;
  onClear: () => void;
}

export interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected";
  error?: string | null;
  onReconnect?: () => void;
}
  
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

export interface Room {
  id: string;
  name: string;
  createdAt: string;
}

export interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export interface RoomCreationPopupProps {
  onCreate: () => void;
  onCancel: () => void;
  newRoomName: string;
  setNewRoomName: (value: string) => void;
}