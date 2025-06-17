import React, { useState } from "react";
import {Controls} from "./Controls";
import {ConnectionStatus} from "./ConnectionStatus";
import {ZoomControls} from "./ZoomControls";
import { Drawing, Point, ShapeType } from "../../types/index";

interface CanvasViewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  connectionStatus: "connected" | "connecting" | "disconnected";
  error?: string | null;
  onReconnect?: () => void;
  onMouseDown: (point: Point, shape: ShapeType, color: string) => void;
  onMouseMove: (point: Point, shape: ShapeType) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onClear: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  getMousePosition: (e: React.MouseEvent<HTMLCanvasElement>) => Point;
}

const CanvasView: React.FC<CanvasViewProps> = ({
  canvasRef,
  connectionStatus,
  error,
  onReconnect,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onClear,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  getMousePosition,
}) => {
  const [selectedShape, setSelectedShape] = useState<ShapeType>("pencil");
  const [color, setColor] = useState("#000000");

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePosition(e);
    onMouseDown(point, selectedShape, color);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePosition(e);
    onMouseMove(point, selectedShape);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#18181b]">
      <ConnectionStatus
        status={connectionStatus}
        error={error}
        onReconnect={onReconnect}
      />

      <Controls
        onColorChange={setColor}
        currentColor={color}
        onShapeSelect={setSelectedShape}
        selectedShape={selectedShape}
        onClear={onClear}
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair z-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />

      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
      />
    </div>
  );
};

export default CanvasView;
