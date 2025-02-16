"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShapeType } from "./types";
import { Controls } from "./Controls";

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
  const [color, setColor] = useState("#000000");

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach((line) => drawLine(ctx, line));
    circles.forEach((circle) => drawCircle(ctx, circle));
    rectangles.forEach((rect) => drawRectangle(ctx, rect));

    if (isDrawing && selectedShape === "pencil" && currentLine) {
      drawLine(ctx, currentLine);
    }
  }, [lines, circles, rectangles, isDrawing, currentLine, selectedShape]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    if (selectedShape === "pencil") {
      setCurrentLine({ points: [[x, y]], color });
    } else if (selectedShape === "circle") {
      setCircles((prevCircles) => [...prevCircles, { x, y, radius: 0, color }]);
    } else if (selectedShape === "rectangle") {
      setRectangles((prevRectangles) => [
        ...prevRectangles,
        { x, y, width: 0, height: 0, color },
      ]);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedShape === "pencil" && currentLine) {
      setCurrentLine((prevLine) => ({
        ...prevLine!,
        points: [...prevLine!.points, [x, y]],
      }));
    } else if (selectedShape === "circle" && circles.length > 0) {
      setCircles((prevCircles) => {
        const updatedCircles = [...prevCircles];
        const lastCircle = updatedCircles.pop();
        if (!lastCircle) return prevCircles;
        const radius = Math.sqrt((x - lastCircle.x) ** 2 + (y - lastCircle.y) ** 2);
        return [...updatedCircles, { ...lastCircle, radius }];
      });
    } else if (selectedShape === "rectangle" && rectangles.length > 0) {
      setRectangles((prevRectangles) => {
        const updatedRects = [...prevRectangles];
        const lastRect = updatedRects.pop();
        if (!lastRect) return prevRectangles;
        return [
          ...updatedRects,
          { ...lastRect, width: x - lastRect.x, height: y - lastRect.y },
        ];
      });
    }
    redraw();
  };

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    if (selectedShape === "pencil" && currentLine && currentLine.points.length > 1) {
      setLines((prevLines) => [...prevLines, currentLine]);
    }
    setCurrentLine(null);
  }, [currentLine, selectedShape]);

  const handleMouseOut = useCallback(() => {
    setIsDrawing(false);
    setCurrentLine(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseOut);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseOut]);

  const drawLine = (ctx: CanvasRenderingContext2D, line: Line) => {
    ctx.strokeStyle = line.color;
    ctx.beginPath();
    ctx.moveTo(line.points[0][0], line.points[0][1]);
    line.points.slice(1).forEach((point) => ctx.lineTo(point[0], point[1]));
    ctx.stroke();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    ctx.strokeStyle = circle.color;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, rect: Rectangle) => {
    ctx.strokeStyle = rect.color;
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();
  };

  const handleShapeSelect = (shape: ShapeType) => {
    setSelectedShape(shape);
    setIsDrawing(false);
    setCurrentLine(null);
  };

  const handleClear = () => {
    setLines([]);
    setCircles([]);
    setRectangles([]);
    setCurrentLine(null);
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Controls
        onShapeSelect={handleShapeSelect}
        onClear={handleClear}
        selectedShape={selectedShape}
        onColorChange={setColor}
        currentColor={color}
      />
    <div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="bg-[#18181b] overflow-hidden"
      >
      </canvas>
    </div>
    </div>
  );
};

export default Canvas;
