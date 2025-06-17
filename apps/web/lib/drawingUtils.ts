import { Drawing, Point, ShapeType } from "../types/index";

export const ZOOM_STEP = 0.1;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;

export const createDrawing = (
  shape: ShapeType,
  color: string,
  point: Point
): Drawing => {
  const baseDrawing = { color };

  switch (shape) {
    case "pencil":
      return { ...baseDrawing, type: "pencil", points: [point] };
    case "rectangle":
      return { ...baseDrawing, type: "rectangle", startPoint: point, width: 0, height: 0 };
    case "circle":
      return { ...baseDrawing, type: "circle", center: point, radius: 0 };
    default:
      return { ...baseDrawing, type: "pencil", points: [point] };
  }
};

export const updateDrawingShape = (
  drawing: Drawing,
  currentPoint: Point,
  startPoint: Point,
  shape: ShapeType
): Drawing => {
  switch (shape) {
    case "pencil":
      if (drawing.type === "pencil") {
        return { ...drawing, points: [...(drawing.points || []), currentPoint] };
      }
      break;
    case "rectangle":
      if (drawing.type === "rectangle") {
        return {
          ...drawing,
          width: currentPoint.x - startPoint.x,
          height: currentPoint.y - startPoint.y,
        };
      }
      break;
    case "circle":
      if (drawing.type === "circle") {
        return {
          ...drawing,
          radius: Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y),
        };
      }
      break;
  }
  return drawing;
};