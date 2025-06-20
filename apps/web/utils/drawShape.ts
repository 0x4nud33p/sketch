import { Drawing } from "@/types/index"

export const drawShape = (ctx: CanvasRenderingContext2D, shape: Drawing) => {
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