import prisma from "@repo/db/client";
import { Drawing, WebSocketWithRoom, RoomData } from "../src/types";

export async function getDrawingsFromDB(roomId: string): Promise<Drawing[]> {
    try {
      const drawings = await prisma.drawing.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
      });
      console.log("get drawings from db",drawings);
      return drawings.map((d) => ({
        id: d.id,
        type: d.type as Drawing['type'],
        points: d.points as [number, number][] || undefined,
        startPoint: d.startX !== null && d.startY !== null 
          ? { x: d.startX, y: d.startY } 
          : undefined,
        width: d.width ?? undefined,
        height: d.height ?? undefined,
        center: d.centerX !== null && d.centerY !== null 
          ? { x: d.centerX, y: d.centerY } 
          : undefined,
        radius: d.radius ?? undefined,
        color: d.color,
        size: d.size || 2,
        timestamp: d.createdAt.getTime()
      }));
    } catch (error) {
      console.error("Error fetching drawings:", error);
      return [];
    }
  }