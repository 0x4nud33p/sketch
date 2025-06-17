"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useCanvas } from "../../hooks/useCanvas";
import { useDrawing } from "../../hooks/useDrawing";
import { toast } from "sonner";
import CanvasView from "./CanvasView";
import { ZOOM_STEP, MIN_ZOOM, MAX_ZOOM } from "../../lib/drawingUtils";
import { Drawing } from "types";

const CanvasContainer = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams?.get("roomid");

  if (!roomId) {
    redirect("/join");
    return null;
  }

  const {
    isConnected,
    isConnecting,
    error,
    sendDrawing,
    clearCanvas: wsClearCanvas,
    reconnect,
    drawings,
    setDrawings,
  } = useWebSocketDrawing(roomId);

  const {
    isDrawing,
    currentDrawing,
    startDrawing,
    updateDrawing,
    finishDrawing,
    cancelDrawing,
  } = useDrawing();

  const {
    canvasRef,
    getMousePosition,
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,
  } = useCanvasDrawing(drawings, currentDrawing);

  const handleClearCanvas = useCallback(async () => {
    try {
      const res = await fetch("/api/drawings", { method: "DELETE" });

      if (!res.ok) {
        toast.error("Failed to clear canvas");
        return;
      }

      toast.success("Canvas cleared");
      setDrawings([]);

      if (!wsClearCanvas()) {
        toast.error("Failed to clear canvas - connection lost");
      }
    } catch (error) {
      console.error("Failed to clear canvas:", error);
      toast.error("Failed to clear canvas");
    }
  }, [wsClearCanvas, setDrawings]);

  const connectionStatus = isConnected
    ? "connected"
    : isConnecting
      ? "connecting"
      : "disconnected";

  return (
    <CanvasView
      canvasRef={canvasRef}
      connectionStatus={connectionStatus}
      error={error}
      onReconnect={reconnect}
      onMouseDown={startDrawing}
      onMouseMove={updateDrawing}
      onMouseUp={finishDrawing}
      onMouseLeave={cancelDrawing}
      onClear={handleClearCanvas}
      zoomLevel={zoomLevel}
      onZoomIn={() =>
        setZoomLevel((prev: number) => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
      }
      onZoomOut={() =>
        setZoomLevel((prev: number) => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
      }
      onResetZoom={() => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      }}
      getMousePosition={getMousePosition}
    />
  );
};

// Custom hook composition
const useWebSocketDrawing = (roomId: string) => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);

  const ws = useWebSocket({
    roomId,
    onInitialDrawings: setDrawings,
    onNewDrawing: useCallback((drawing: Drawing) => {
      setDrawings((prev) => [...prev, drawing]);
    }, []),
    onCanvasClear: useCallback(() => setDrawings([]), []),
  });

  return { ...ws, drawings, setDrawings };
};

const useCanvasDrawing = (
  drawings: Drawing[],
  currentDrawing: Drawing | null
) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const allDrawings = useMemo(() => {
    return currentDrawing ? [...drawings, currentDrawing] : drawings;
  }, [drawings, currentDrawing]);

  const canvas = useCanvas({
    drawings: allDrawings,
    zoomLevel,
    panOffset,
  });

  return { ...canvas, zoomLevel, setZoomLevel, panOffset, setPanOffset };
};

export default CanvasContainer;
