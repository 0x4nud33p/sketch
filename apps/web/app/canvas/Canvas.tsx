"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ShapeType } from './types';
import { Controls } from './Controls';

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
  const [selectedShape, setSelectedShape] = useState<ShapeType>('pencil');
  const [circles, setCircles] = useState<Circle[]>([]);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;

        const handleMouseDown = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (selectedShape === 'pencil') {
            setIsDrawing(true);
            setCurrentLine({ points: [[x, y]], color });
          } else if (selectedShape === 'circle') {
            setCircles([...circles, { x, y, radius: 0, color }]);
          } else if (selectedShape === 'rectangle') {
            setRectangles([...rectangles, { x, y, width: 0, height: 0, color }]);
          }
        };

        const handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (selectedShape === 'pencil' && isDrawing && currentLine) {
            const newPoints = [...currentLine.points, [x, y]];
            setCurrentLine({ ...currentLine, points: newPoints });
            redraw(ctx);
          } else if (selectedShape === 'circle' && circles.length > 0) {
            const lastCircle = circles[circles.length - 1];
            const radius = Math.sqrt((x - lastCircle.x) ** 2 + (y - lastCircle.y) ** 2);
            const updatedCircles = circles.slice(0, -1).concat({ ...lastCircle, radius });
            setCircles(updatedCircles);
            redraw(ctx);
          } else if (selectedShape === 'rectangle' && rectangles.length > 0) {
            const lastRect = rectangles[rectangles.length - 1];
            const width = x - lastRect.x;
            const height = y - lastRect.y;
            const updatedRects = rectangles.slice(0, -1).concat({ ...lastRect, width, height });
            setRectangles(updatedRects);
            redraw(ctx);
          }
        };

        const handleMouseUp = () => {
          setIsDrawing(false);
          if (currentLine && currentLine.points.length > 1 && selectedShape === 'pencil') {
            setLines([...lines, currentLine]);
          }
          setCurrentLine(null);
        };

        const handleMouseOut = () => {
          setIsDrawing(false);
          setCurrentLine(null);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseout', handleMouseOut);

        return () => {
          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('mouseout', handleMouseOut);
        };
      }
    }
  }, [currentLine, lines, selectedShape, circles, rectangles, isDrawing, color]);

  const redraw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    lines.forEach((line) => drawLine(ctx, line));
    circles.forEach((circle) => drawCircle(ctx, circle));
    rectangles.forEach((rect) => drawRectangle(ctx, rect));

    if (isDrawing && selectedShape === 'pencil' && currentLine) {
      drawLine(ctx, currentLine);
    }
  };

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
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        setLines([]);
        setCircles([]);
        setRectangles([]);
        setCurrentLine(null);
      }
    }
  };

  return (
    <div>
      <Controls
        onShapeSelect={handleShapeSelect}
        onClear={handleClear}
        selectedShape={selectedShape}
        onColorChange={setColor}
        currentColor={color}
      />
      <canvas ref={canvasRef} width="2000" height="1000" className="bg-[#18181b]"></canvas>
    </div>
  );
};

export default Canvas;