"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ShapeType } from "./types";
import { Controls } from "./Controls";
import { redirect, useSearchParams } from "next/navigation";
import axios from "axios";
import { Drawing, Point } from "./types";
import { toast } from "sonner";

// Enhanced drawing function with better type safety
const drawShape = (ctx: CanvasRenderingContext2D, shape: Drawing) => {
  if (!shape) return;

  ctx.strokeStyle = shape.color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (shape.type) {
    case "pencil":
      if (shape.points && shape.points.length > 0) {
        ctx.beginPath();
        const firstPoint = shape.points[0];
        if (firstPoint) {
          const { x: firstX, y: firstY } = firstPoint;
          ctx.moveTo(firstX, firstY);
          shape.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
      }
      break;

    case "rectangle":
      if (
        shape.startPoint &&
        typeof shape.width === "number" &&
        typeof shape.height === "number"
      ) {
        ctx.beginPath();
        ctx.strokeRect(
          shape.startPoint.x,
          shape.startPoint.y,
          shape.width,
          shape.height
        );
      }
      break;

    case "circle":
      if (shape.center && typeof shape.radius === "number") {
        ctx.beginPath();
        ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
  }
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("pencil");
  const [color, setColor] = useState("#000000");
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Room and drawings state
  const [roomId, setRoomId] = useState<string>("");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  // Memoize all drawings for better performance
  const allDrawings = useMemo(() => {
    return currentDrawing ? [...drawings, currentDrawing] : drawings;
  }, [drawings, currentDrawing]);

  // Canvas setup and resize handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        // Preserve canvas styles after resize
        ctx.imageSmoothingEnabled = true;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback((roomIdParam: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;
    setConnectionStatus("connecting");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
      ws.send(JSON.stringify({ type: "join_room", room: roomIdParam }));

      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "initial_drawings") {
          if (Array.isArray(data.data)) {
            setDrawings(data.data);
          } else {
            console.error("Invalid initial_drawings data:", data.data);
          }
        } else if (data.type === "drawing") {
          const shape = data.drawingData;
          if (shape) {
            setDrawings((prev) => [...prev, shape]);
          } else {
            console.error("Invalid drawing data:", data);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus("disconnected");

      // Auto-reconnect after 3 seconds if not intentionally closed
      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connectWebSocket(roomIdParam);
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket Connection error");
      setConnectionStatus("disconnected");
      return;
    };
  }, []);

  // Room setup and WebSocket initialization
  useEffect(() => {
    const roomIdParam = searchParams?.get("roomid");
    if (!roomIdParam) {
      redirect("/join");
      return;
    }

    setRoomId(roomIdParam);
    connectWebSocket(roomIdParam);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
    };
  }, [searchParams, connectWebSocket]);

  // Clear canvas function
  const clearCanvas = async () => {
    try {
      await axios.delete(`/api/drawings?roomId=${roomId}`);
      setDrawings([]);
      setCurrentDrawing(null);

      // Notify other clients about canvas clear
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "clear_canvas",
            room: roomId,
          })
        );
      }
    } catch (error) {
      console.error("Failed to clear canvas", error);
    }
  };

  // Optimized redraw function
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Apply transformations
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(panOffset.x, panOffset.y);

    // Draw all shapes
    allDrawings.forEach((shape) => drawShape(ctx, shape));

    ctx.restore();
  }, [allDrawings, zoomLevel, panOffset]);

  // Redraw on changes
  useEffect(() => {
    const animationId = requestAnimationFrame(redraw);
    return () => cancelAnimationFrame(animationId);
  }, [redraw]);

  // Mouse position calculation with zoom and pan
  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoomLevel - panOffset.x,
      y: (e.clientY - rect.top) / zoomLevel - panOffset.y,
    };
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePosition(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    let newDrawing: Drawing;

    switch (selectedShape) {
      case "pencil":
        newDrawing = {
          type: "pencil",
          color,
          points: [{ x, y }],
        };
        break;
      case "rectangle":
        newDrawing = {
          type: "rectangle",
          color,
          startPoint: { x, y },
          width: 0,
          height: 0,
        };
        break;
      case "circle":
        newDrawing = {
          type: "circle",
          color,
          center: { x, y },
          radius: 0,
        };
        break;
      default:
        // fallback to pencil if somehow an unknown shape is selected
        newDrawing = {
          type: "pencil",
          color,
          points: [{ x, y }],
        };
        break;
    }

    setCurrentDrawing(newDrawing);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !currentDrawing) return;
    const { x, y } = getMousePosition(e);

    setCurrentDrawing((prev) => {
      if (!prev) return null;

      let updated = { ...prev };

      switch (selectedShape) {
        case "pencil":
          if (updated.type === "pencil") {
            updated = {
              ...updated,
              points: [
                ...(prev.type === "pencil" && prev.points ? prev.points : []),
                { x, y },
              ],
            };
          }
          break;
        case "rectangle":
          if (updated.type === "rectangle") {
            updated.width = x - startPoint.x;
            updated.height = y - startPoint.y;
          }
          break;
        case "circle":
          if (updated.type === "circle") {
            updated.radius = Math.hypot(x - startPoint.x, y - startPoint.y);
          }
          break;
      }

      return updated;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDrawing) return;

    // Add to drawings
    setDrawings((prev) => [...prev, currentDrawing]);

    // Send to WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "drawing",
          room: roomId,
          drawingData: currentDrawing,
        })
      );
    }

    // Reset drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentDrawing(null);
  };

  // Zoom functions
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <div className="absolute top-4 right-4 z-30">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === "connected"
              ? "text-green-800"
              : connectionStatus === "connecting"
                ? "text-yellow-800"
                : "text-red-800"
          }`}
        >
          {connectionStatus === "connected" && " Connected"}
          {connectionStatus === "connecting" && " Connecting..."}
          {connectionStatus === "disconnected" && " Disconnected"}
        </div>
      </div>

      <div className="border-yellow-300">
        <Controls
          onColorChange={setColor}
          currentColor={color}
          onShapeSelect={setSelectedShape}
          selectedShape={selectedShape}
          onClear={clearCanvas}
        />
      </div>

      <canvas
        ref={canvasRef}
        className="bg-[#18181b] top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDrawing) {
            handleMouseUp();
          }
        }}
      />

      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleResetZoom}
          className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-full flex items-center justify-center shadow-lg transition-colors"
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      <div className="absolute bottom-4 left-20 bg-black/50 text-white px-2 py-1 rounded text-sm">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

export default Canvas;
