"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShapeType } from "./types";
import { Controls } from "./Controls";
import { useSearchParams } from 'next/navigation';
import prisma from "@repo/db/client";

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
  const ws = useRef<WebSocket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("pencil");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [color, setColor] = useState("#000000");
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState<string>("");
  
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

   useEffect(() => {
    if (!roomId) {
      fetch('/api/createroom')
        .then((response) => response.json())
        .then((data) => {
          const id = data.id;
          setRoomId(id);
          const params = new URLSearchParams(window.location.search);
          params.set('roomid', id);
          window.history.replaceState({}, '', `?${params.toString()}`);
        })
        .catch((error) => {
          console.error('Error creating room:', error);
        });
    }
  }, [roomId]);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080");

      ws.current.onopen = () => {
        console.log("Connected to WebSocket server");
        ws.current?.send(JSON.stringify({ type: "join_room", roomId }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "drawing") {
          setLines((prevLines) => [...prevLines, data.drawingData]);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.current.onclose = () => {
        console.log("Disconnected from WebSocket server");
        // Optionally implement reconnection logic here
      };
    };

    connectWebSocket();

    return () => {
      ws.current?.close();
    };
  }, [roomId]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach((line) => drawLine(ctx, line));
    circles.forEach((circle) => drawCircle(ctx, circle));
    rectangles.forEach((rect) => drawRectangle(ctx, rect));
  }, [lines, circles, rectangles]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      redraw();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
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
    
    lastMousePosition.current = { x, y }; // Store initial mouse position
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !startPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastMousePosition.current = { x, y }; // Update last mouse position

    if (selectedShape === "pencil" && currentLine) {
      setCurrentLine((prevLine) => ({
        ...prevLine!,
        points: [...prevLine!.points, [x, y]],
      }));
    }
    
    redraw();
  };

  const handleMouseUp = () => {
    if (!canvasRef.current || !startPoint || !lastMousePosition.current) return;

    if (selectedShape === "pencil" && currentLine) {
      setLines((prev) => [...prev, currentLine]);
      ws.current?.send(JSON.stringify({ type: "drawing", roomId, drawingData: currentLine }));
      
      // Reset current line after sending to server
      setCurrentLine(null);
    } else if (selectedShape === "circle" && startPoint) {
      const radius = Math.sqrt(
        Math.pow(lastMousePosition.current.x - startPoint.x, 2) +
        Math.pow(lastMousePosition.current.y - startPoint.y, 2)
      );
      
      const newCircle: Circle = { x: startPoint.x, y: startPoint.y, radius, color };
      setCircles((prev) => [...prev, newCircle]);
      
      // Optionally send circle data over WebSocket
    } else if (selectedShape === "rectangle" && startPoint) {
      const width = lastMousePosition.current.x - startPoint.x;
      const height = lastMousePosition.current.y - startPoint.y;

      const newRectangle: Rectangle = { x: startPoint.x, y: startPoint.y, width, height, color };
      setRectangles((prev) => [...prev, newRectangle]);
      
      // Optionally send rectangle data over WebSocket
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  const drawLine = (ctx: CanvasRenderingContext2D, line: Line) => {
    ctx.strokeStyle = line.color;
    ctx.beginPath();
    ctx.moveTo(line.points[0][0], line.points[0][1]);
    
    line.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    
    ctx.stroke();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    ctx.strokeStyle = circle.color;
    ctx.beginPath();
    
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    
    ctx.stroke();
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, rect: Rectangle) => {
    ctx.strokeStyle = rect.color;
    
    ctx.beginPath();
    
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    
    ctx.stroke();
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Controls
        onColorChange={setColor}
        currentColor={color}
        onShapeSelect={setSelectedShape}
        onClear={() => { 
          setLines([]); 
          setCircles([]); 
          setRectangles([]); 
        }}
        selectedShape={selectedShape}
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

const createRoomId = async () => {
  const newRoom = await prisma.room.create({
    data: {} 
  });
  return newRoom.id;
};


