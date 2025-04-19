"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShapeType } from "./types";
import { Controls } from "./Controls";
import { redirect, useSearchParams } from "next/navigation";
import axios from "axios";
import { Drawing, Point } from "./types";

const drawShape = (ctx: CanvasRenderingContext2D, shape: Drawing) => {
  ctx.strokeStyle = shape.color;

  if (shape.points) {
    ctx.beginPath();
    // @ts-ignore
    ctx.moveTo(shape.points[0][0], shape.points[0][1]);
    shape.points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
  } else if (
    shape.startX !== undefined &&
    shape.startY !== undefined &&
    shape.width !== undefined &&
    shape.height !== undefined
  ) {
    ctx.beginPath();
    ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
  } else if (
    shape.centerX !== undefined &&
    shape.centerY !== undefined &&
    shape.radius !== undefined
  ) {
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchParams = useSearchParams();
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("pencil");
  const [color, setColor] = useState("#000000");
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [lines, setLines] = useState<Drawing[]>([]);
  const [circles, setCircles] = useState<Drawing[]>([]);
  const [rectangles, setRectangles] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const roomIdParam = searchParams?.get("roomid");
    if (!roomIdParam) {
      redirect("/join");
      return;
    }
    setRoomId(roomIdParam);

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join_room", room: roomIdParam }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "initial_drawings") {
          if (!Array.isArray(data.data)) {
            console.error("Invalid initial_drawings data:", data.data);
            return;
          }

          const newLines: Drawing[] = [];
          const newCircles: Drawing[] = [];
          const newRectangles: Drawing[] = [];

          data.data.forEach((shape: Drawing) => {
            if (shape.points) {
              newLines.push({ points: shape.points, color: shape.color });
            } else if (shape.centerX !== undefined) {
              newCircles.push({ ...shape });
            } else if (shape.startX !== undefined) {
              newRectangles.push({ ...shape });
            }
          });

          setLines(newLines);
          setCircles(newCircles);
          setRectangles(newRectangles);
        } else if (data.type === "drawing") {
          const shape = data.drawingData;
          if (!shape) {
            console.error("Invalid drawing data:", data);
            return;
          }

          if (shape.points) setLines((prev) => [...prev, shape]);
          else if (shape.centerX !== undefined)
            setCircles((prev) => [...prev, shape]);
          else if (shape.startX !== undefined)
            setRectangles((prev) => [...prev, shape]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [searchParams]);

  const clearCanvas = async () => {
    try {
      await axios.delete(`/api/drawings?roomId=${roomId}`);
      setLines([]);
      setCircles([]);
      setRectangles([]);
      setCurrentDrawing(null);
    } catch (error) {
      console.error("Failed to clear canvas", error);
    }
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    [...lines, ...circles, ...rectangles, currentDrawing].forEach((shape) => {
      if (shape) drawShape(ctx, shape);
    });
    ctx.restore();
  }, [lines, circles, rectangles, currentDrawing, zoomLevel]);

  useEffect(() => {
    requestAnimationFrame(redraw);
  }, [redraw]);

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoomLevel,
      y: (e.clientY - rect.top) / zoomLevel,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePosition(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    if (selectedShape === "pencil") {
      setCurrentDrawing({ color, points: [[x, y]] });
    } else if (selectedShape === "rectangle") {
      setCurrentDrawing({ color, startX: x, startY: y, width: 0, height: 0 });
    } else if (selectedShape === "circle") {
      setCurrentDrawing({ color, centerX: x, centerY: y, radius: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const { x, y } = getMousePosition(e);

    setCurrentDrawing((prev) => {
      if (!prev) return null;
      if (selectedShape === "pencil") {
        return { ...prev, points: [...(prev.points || []), [x, y]] };
      }
      if (selectedShape === "rectangle") {
        return { ...prev, width: x - prev.startX!, height: y - prev.startY! };
      }
      if (selectedShape === "circle") {
        return {
          ...prev,
          radius: Math.hypot(x - startPoint.x, y - startPoint.y),
        };
      }
      return prev;
    });
  };

  const handleMouseUp = () => {
    if (!startPoint || !currentDrawing) return;

    if (selectedShape === "pencil") setLines([...lines, currentDrawing]);
    if (selectedShape === "rectangle")
      setRectangles([...rectangles, currentDrawing]);
    if (selectedShape === "circle") setCircles([...circles, currentDrawing]);

    if (wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: "drawing",
          room: roomId,
          drawingData: currentDrawing,
        })
      );
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentDrawing(null);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
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
        className="bg-[#18181b] top-0 left-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 3))}
          className="w-10 h-10 bg-blue-500 text-white text-xl rounded-full flex items-center justify-center shadow"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}
          className="w-10 h-10 bg-blue-500 text-white text-xl rounded-full flex items-center justify-center shadow"
        >
          -
        </button>
      </div>
    </div>
  );
};

export default Canvas;
