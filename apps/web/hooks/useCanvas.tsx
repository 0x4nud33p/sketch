import { useCallback, useEffect, useRef, useState } from "react";
import { Drawing, Point, ShapeType, CanvasState } from "@/types";

interface UseCanvasOptions {
  onDrawingComplete?: (drawing: Drawing) => void;
  onDrawingUpdate?: (drawing: Drawing) => void;
}

export const useCanvas = ({ onDrawingComplete, onDrawingUpdate }: UseCanvasOptions = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoomLevel: 1,
    panOffset: { x: 0, y: 0 },
    isDrawing: false,
    selectedShape: "pencil" as ShapeType,
    color: "#000000",
    startPoint: null,
    currentDrawing: null,
  });

  const [drawings, setDrawings] = useState<Drawing[]>([]);

  // Setup canvas with proper DPI handling
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  // Optimized drawing function
  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Drawing) => {
    ctx.save();
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = 2;

    switch (shape.type) {
      case "pencil":
        if (shape.points && shape.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
          for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i]!.x, shape.points[i]!.y);
          }
          ctx.stroke();
        }
        break;
      case "rectangle":
        ctx.strokeRect(shape.startPoint!.x, shape.startPoint!.y, shape.width, shape.height);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(shape.center.x, shape.center.y, shape.radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
    }
    ctx.restore();
  }, []);

  // Optimized redraw with RAF
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
    ctx.scale(canvasState.zoomLevel, canvasState.zoomLevel);
    ctx.translate(canvasState.panOffset.x, canvasState.panOffset.y);

    // Draw all shapes
    const allDrawings = canvasState.currentDrawing 
      ? [...drawings, canvasState.currentDrawing] 
      : drawings;
    
    allDrawings.forEach((shape) => drawShape(ctx, shape));
    ctx.restore();
  }, [drawings, canvasState, drawShape]);

  // Schedule redraw
  const scheduleRedraw = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(redraw);
  }, [redraw]);

  // Get mouse position with zoom/pan compensation
  const getMousePosition = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / canvasState.zoomLevel - canvasState.panOffset.x,
      y: (e.clientY - rect.top) / canvasState.zoomLevel - canvasState.panOffset.y,
    };
  }, [canvasState.zoomLevel, canvasState.panOffset]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getMousePosition(e);
    
    let newDrawing: Drawing;
    
    switch (canvasState.selectedShape) {
      case "pencil":
        newDrawing = {
          type: "pencil",
          color: canvasState.color,
          points: [position],
        };
        break;
      case "rectangle":
        newDrawing = {
          type: "rectangle",
          color: canvasState.color,
          startPoint: position,
          width: 0,
          height: 0,
        };
        break;
      case "circle":
        newDrawing = {
          type: "circle",
          color: canvasState.color,
          center: position,
          radius: 0,
        };
        break;
      default:
        newDrawing = {
          type: "pencil",
          color: canvasState.color,
          points: [position],
        };
    }

    setCanvasState(prev => ({
      ...prev,
      isDrawing: true,
      startPoint: position,
      currentDrawing: newDrawing,
    }));
  }, [canvasState.selectedShape, canvasState.color, getMousePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasState.isDrawing || !canvasState.startPoint || !canvasState.currentDrawing) return;
    
    const position = getMousePosition(e);
    
    setCanvasState(prev => {
      if (!prev.currentDrawing || !prev.startPoint) return prev;
      
      let updatedDrawing = { ...prev.currentDrawing };
      
      switch (prev.selectedShape) {
        case "pencil":
          if (updatedDrawing.type === "pencil") {
            updatedDrawing.points = [...updatedDrawing.points, position];
          }
          break;
        case "rectangle":
          if (updatedDrawing.type === "rectangle") {
            updatedDrawing.width = position.x - prev.startPoint.x;
            updatedDrawing.height = position.y - prev.startPoint.y;
          }
          break;
        case "circle":
          if (updatedDrawing.type === "circle") {
            updatedDrawing.radius = Math.hypot(
              position.x - prev.startPoint.x,
              position.y - prev.startPoint.y
            );
          }
          break;
      }
      
      onDrawingUpdate?.(updatedDrawing);
      
      return {
        ...prev,
        currentDrawing: updatedDrawing,
      };
    });
  }, [canvasState.isDrawing, canvasState.startPoint, canvasState.currentDrawing, getMousePosition, onDrawingUpdate]);

  const handleMouseUp = useCallback(() => {
    if (!canvasState.isDrawing || !canvasState.currentDrawing) return;

    const finalDrawing = canvasState.currentDrawing;
    
    setDrawings(prev => [...prev, finalDrawing]);
    setCanvasState(prev => ({
      ...prev,
      isDrawing: false,
      startPoint: null,
      currentDrawing: null,
    }));

    onDrawingComplete?.(finalDrawing);
  }, [canvasState.isDrawing, canvasState.currentDrawing, onDrawingComplete]);

  // Canvas setup effect
  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  // Redraw effect
  useEffect(() => {
    scheduleRedraw();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scheduleRedraw]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 0.1, 3),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 0.1, 0.5),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
    }));
  }, []);

  const clearCanvas = useCallback(() => {
    setDrawings([]);
    setCanvasState(prev => ({
      ...prev,
      currentDrawing: null,
      isDrawing: false,
      startPoint: null,
    }));
  }, []);

  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
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
    clearCanvas,
  };
};