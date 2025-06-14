import { Drawing, WebSocketWithRoom, RoomData } from "../src/types";
import prisma from "@repo/db/client";

export async function storeDrawingToDb(roomId: string, drawing: Drawing): Promise<void> {
    try {
      await prisma.drawing.create({
        data: {
          roomId,
          type: drawing.type,
          points: drawing.points || undefined,
          startX: drawing.startPoint?.x ?? null,
          startY: drawing.startPoint?.y ?? null,
          width: drawing.width ?? null,
          height: drawing.height ?? null,
          centerX: drawing.center?.x ?? null,
          centerY: drawing.center?.y ?? null,
          radius: drawing.radius ?? null,
          color: drawing.color,
          size: drawing.size ?? 2,
        }
      });
    } catch (error) {
      console.error("Error storing drawing:", error);
    }
  }