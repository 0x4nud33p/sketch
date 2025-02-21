"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShapeType } from "./types";
import { Controls } from "./Controls";
import { redirect, useSearchParams } from 'next/navigation';
import axios from "axios";

interface Line {
  points: [number, number][];
  color: string;
}

interface Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("pencil");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [currentCircle, setCurrentCircle] = useState<Circle | null>(null);
  const [currentRectangle, setCurrentRectangle] = useState<Rectangle | null>(null);
  const [color, setColor] = useState("#000000");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string>("");

  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const roomId = searchParams?.get('roomid');
    if (!roomId) {
      redirect("/join-room");
    } else {
      setRoomId(roomId);
      fetchDrawings(roomId);
    }
  }, [searchParams]);

  const fetchDrawings = async (roomId: string) => {
    try {
      const response = await axios.get(`/api/drawings?roomId=${roomId}`);
      setLines(response.data.lines || []);
      setCircles(response.data.circles || []);
      setRectangles(response.data.rectangles || []);
    } catch (error) {
      console.error("Failed to fetch drawings", error);
    }
  };

  const saveDrawing = async (data: Line | Circle | Rectangle, type: string) => {
    try {
      await axios.post("/api/drawings", { roomId, type, data });
    } catch (error) {
      console.error("Failed to save drawing", error);
    }
  };

  const clearCanvas = async () => {
    try {
      await axios.delete(`/api/drawings?roomId=${roomId}`);
      setLines([]);
      setCircles([]);
      setRectangles([]);
      setCurrentLine(null);
      setCurrentCircle(null);
      setCurrentRectangle(null);
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

    lines.forEach((line) => drawLine(ctx, line));
    circles.forEach((circle) => drawCircle(ctx, circle));
    rectangles.forEach((rect) => drawRectangle(ctx, rect));

    if (currentLine) drawLine(ctx, currentLine);
    if (currentCircle) drawCircle(ctx, currentCircle);
    if (currentRectangle) drawRectangle(ctx, currentRectangle);
  }, [lines, circles, rectangles, currentLine, currentCircle, currentRectangle]);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      redraw();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [redraw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (selectedShape === "pencil") {
      setCurrentLine({ points: [[x, y]], color });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !startPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedShape === "pencil" && currentLine) {
      setCurrentLine((prevLine) => ({ ...prevLine!, points: [...prevLine!.points, [x, y]] }));
    }
  };

  const handleMouseUp = () => {
    if (!startPoint) return;

    if (selectedShape === "pencil" && currentLine) {
      setLines((prev) => [...prev, currentLine]);
      saveDrawing(currentLine, "line");
      setCurrentLine(null);
    }
    setIsDrawing(false);
    setStartPoint(null);
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