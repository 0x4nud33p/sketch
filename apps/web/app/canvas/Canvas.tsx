"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShapeType } from "./types";
import { Controls } from "./Controls";
import { redirect, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

interface Point {
  x: number;
  y: number;
}

interface Drawing {
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

const drawShape = (ctx: CanvasRenderingContext2D, shape: Drawing) => {
  ctx.strokeStyle = shape.color;
  ctx.beginPath();

  if (shape.points) {
    //@ts-ignore
    ctx.moveTo(shape.points[0][0], shape.points[0][1]);
    shape.points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
  } else if (shape.startX !== undefined && shape.startY !== undefined && shape.width !== undefined && shape.height !== undefined) {
    ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
  } else if (shape.centerX !== undefined && shape.centerY !== undefined && shape.radius !== undefined) {
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
  const wsRef = useRef<WebSocket | null>(null);

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
    console.log("WebSocket connected");
    ws.send(JSON.stringify({ type: "join_room", room: roomIdParam }));
  };

 ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("Received WebSocket data:", data);

    // Handle Initial Drawings
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
        } else if (shape.centerX !== undefined && shape.centerY !== undefined && shape.radius !== undefined) {
          newCircles.push({ centerX: shape.centerX, centerY: shape.centerY, radius: shape.radius, color: shape.color });
        } else if (shape.startX !== undefined && shape.startY !== undefined && shape.width !== undefined && shape.height !== undefined) {
          newRectangles.push({ startX: shape.startX, startY: shape.startY, width: shape.width, height: shape.height, color: shape.color });
        }
      });

      console.log("Setting initial drawings:", { newLines, newCircles, newRectangles });

      setLines(newLines);
      setCircles(newCircles);
      setRectangles(newRectangles);
    }

    // Handle Real-Time Drawings 
    if (data.type === "drawing") {
      if (!data.drawingData) { 
        console.error("Invalid drawing data:", data);
        return;
      }
      const shape = data.drawingData;
        if (shape.points) {
        setLines((prevLines) => [...prevLines, { points: shape.points, color: shape.color }]);
      } else if (shape.centerX !== undefined && shape.centerY !== undefined && shape.radius !== undefined) {
        setCircles((prevCircles) => [...prevCircles, { centerX: shape.centerX, centerY: shape.centerY, radius: shape.radius, color: shape.color }]);
      } else if (shape.startX !== undefined && shape.startY !== undefined && shape.width !== undefined && shape.height !== undefined) {
        setRectangles((prevRectangles) => [...prevRectangles, { startX: shape.startX, startY: shape.startY, width: shape.width, height: shape.height, color: shape.color }]);
      }
    }
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
  }
};
  ws.onclose = () => console.log("WebSocket disconnected");
  ws.onerror = (error) => console.error("WebSocket error:", error);

  return () => {
    ws.close();
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [...lines, ...circles, ...rectangles, currentDrawing].forEach((shape) => {
      if (shape) drawShape(ctx, shape);
    });
  }, [lines, circles, rectangles, currentDrawing]);

  useEffect(() => {
    requestAnimationFrame(redraw);
  }, [redraw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePosition(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    const newDrawing: Drawing = { color };
    if (selectedShape === "pencil") newDrawing.points = [[x, y]];
    if (selectedShape === "rectangle") Object.assign(newDrawing, { startX: x, startY: y, width: 0, height: 0 });
    if (selectedShape === "circle") Object.assign(newDrawing, { centerX: x, centerY: y, radius: 0 });
    
    setCurrentDrawing(newDrawing);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    const { x, y } = getMousePosition(e);

    setCurrentDrawing((prev) => {
      if (!prev) return prev;
      if (selectedShape === "pencil") prev.points?.push([x, y]);
      if (selectedShape === "rectangle") Object.assign(prev, { width: x - prev.startX!, height: y - prev.startY! });
      if (selectedShape === "circle") prev.radius = Math.hypot(x - startPoint.x, y - startPoint.y);
      return { ...prev };
    });
  };

  const handleMouseUp = () => {
    if (!startPoint || !currentDrawing) return;
    
    if (selectedShape === "pencil") setLines([...lines, currentDrawing]);
    if (selectedShape === "rectangle") setRectangles([...rectangles, currentDrawing]);
    if (selectedShape === "circle") setCircles([...circles, currentDrawing]);

    console.log("current_drawing",currentDrawing);
    if (wsRef.current && currentDrawing) {
      console.log("current_drawing",currentDrawing);
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

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return { x: e.clientX - rect!.left, y: e.clientY - rect!.top };
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Controls
        onColorChange={setColor}
        currentColor={color}
        onShapeSelect={setSelectedShape}
        selectedShape={selectedShape}
        onClear={clearCanvas}
      />
      <canvas
        ref={canvasRef}
        width="2000"
        height="1000"
        className="bg-[#18181b]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;