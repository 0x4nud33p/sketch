"use client";

import React, { useCallback, useEffect } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { toast } from "sonner";
import { useCanvas } from "@/hooks/useCanvas";
import { useWebSocket } from "@/hooks/useConnectWebSocket";
import { Controls } from "@/components/canvas/Controls";
import { Drawing } from "@/types";
import { clearCanvas } from "@/utils/clearCanvas";

const Canvas = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams?.get("roomid");

  if (!roomId) {
    redirect("/join");
  }

  const handleDrawingComplete = useCallback((drawing: Drawing) => {
    // Send drawing via WebSocket
    sendMessage({
      type: "drawing",
      room: roomId,
      drawingData: drawing,
    });
  }, [roomId]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case "initial_drawings":
        if (Array.isArray(data.data)) {
          setDrawings(data.data);
        }
        break;
      case "drawing":
        if (data.drawingData) {
          setDrawings(prev => [...prev, data.drawingData]);
        }
        break;
      case "canvas_cleared":
        clearCanvas({roomId});
        setDrawings([]);
        toast.info("Canvas cleared");
        break;
      case "error":
        toast.error(data.message || "WebSocket error occurred");
        break;
    }
  }, []);

  const handleWebSocketError = useCallback((error: Event) => {
    toast.error("Connection error occurred");
  }, []);

  const {
    canvasRef,
    canvasState,
    drawings,
    setDrawings,
    updateCanvasState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetZoom,
    clearCanvas: clearCanvasLocal,
  } = useCanvas({ onDrawingComplete: handleDrawingComplete });

  const {
    connect,
    disconnect,
    sendMessage,
    connectionStatus,
    isConnected,
  } = useWebSocket({
    url: "ws://localhost:8080",
    roomId,
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handleClearCanvas = useCallback(() => {
    clearCanvasLocal();
    if (isConnected) {
      sendMessage({
        type: "clear_canvas",
        room: roomId,
      });
    }
  }, [clearCanvasLocal, isConnected, sendMessage, roomId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Share URL copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy URL to clipboard");
    });
  }, []);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "text-green-800 bg-green-200";
      case "connecting": return "text-yellow-800 bg-yellow-200";
      case "error": return "text-red-800 bg-red-200";
      default: return "text-gray-800 bg-gray-200";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected": return "Connected";
      case "connecting": return "Connecting...";
      case "error": return "Connection Error";
      default: return "Disconnected";
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#18181b]">
      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-30">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor()}`}>
          {getConnectionStatusText()}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Controls
          onColorChange={(color) => updateCanvasState({ color })}
          currentColor={canvasState.color}
          onShapeSelect={(shape) => updateCanvasState({ selectedShape: shape })}
          selectedShape={canvasState.selectedShape}
          onHandleShare={handleShare}
          onClear={handleClearCanvas}
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (canvasState.isDrawing) {
            handleMouseUp();
          }
        }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-20 bg-black/50 text-white px-2 py-1 rounded text-sm z-20">
        {Math.round(canvasState.zoomLevel * 100)}%
      </div>
    </div>
  );
};

export default Canvas;