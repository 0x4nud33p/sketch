import express, { Request, Response } from "express";
import { Server, WebSocket } from "ws";
import dotenv from "dotenv";
import prisma from "@repo/db/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new Server({ server });

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
  size?: number;
  [key: string]: any;
}

interface WebSocketWithRoom extends WebSocket {
  room?: string;
}

interface RoomData {
  clients: Set<WebSocketWithRoom>;
  drawings: Drawing[];
}

const rooms: Record<string, RoomData> = {};

// get initial drawings from the database handler
async function getDrawingsFromDB(roomId: string): Promise<Drawing[]> {
  try {
    const drawings = await prisma.drawing.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });
    return drawings.map((d) => ({
      ...d,
      points: d.points as [number, number][] || undefined,
      startX: d.startX ?? undefined,
      startY: d.startY ?? undefined,
      width: d.width ?? undefined,
      height: d.height ?? undefined,
      centerX: d.centerX ?? undefined,
      centerY: d.centerY ?? undefined,
      radius: d.radius ?? undefined,
      size: d.size || 10
    }));
  } catch (error) {
    console.error("Error fetching drawings:", error);
    return [];
  }
}

async function storeDrawingsToDb(roomId: string, drawings: Drawing[]): Promise<void> {
  try {
    const formattedDrawings = drawings.map(drawing => ({
      roomId,
      points: drawing.points || undefined,
      startX: drawing.startX ?? undefined,
      startY: drawing.startY ?? undefined,
      width: drawing.width ?? undefined,
      height: drawing.height ?? undefined,
      centerX: drawing.centerX ?? undefined,
      centerY: drawing.centerY ?? undefined,
      radius: drawing.radius ?? undefined,
      color: drawing.color,
      size: drawing.size ?? 10,
    }));
    await prisma.drawing.createMany({
      data: formattedDrawings,
      skipDuplicates: true,
    });
    console.log(`Saved ${formattedDrawings.length} drawings for room ${roomId}`);
  } catch (error) {
    console.error("Error storing drawings:", error);
  }
}

wss.on("connection", (ws: WebSocketWithRoom) => {
  console.log("New WebSocket connection");

  ws.on("message", async (message: string) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, room, drawingData } = parsedMessage;

      if (type === "join_room" && room) {
        console.log(`Client joined room: ${room}`);
        ws.room = room;

        if (!rooms[room]) {
          rooms[room] = {
            clients: new Set(),
            drawings: []
          };
        }

        rooms[room].clients.add(ws);

        const initialData = await getDrawingsFromDB(room);
        ws.send(JSON.stringify({
          type: "initial_drawings",
          data: initialData
        }));
      }

      if (type === "drawing" && room && drawingData) {
        if (!rooms[room]) {
          console.warn(`Received drawing for non-existent room: ${room}`);
          return;
        }
        rooms[room].drawings.push(drawingData);
        
        rooms[room].clients.forEach(client => {
          console.log("drawing data real time",drawingData);
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "drawing",
              drawingData
            }));
          }
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
  console.log("Closing WebSocket connection for room:", ws.room);
  if (ws.room && rooms[ws.room]) {
    const room = rooms[ws.room];
    room?.clients.delete(ws);

    if (room?.clients.size === 0) {
      console.log(`Saving drawings for room ${ws.room}`);

      storeDrawingsToDb(ws.room, room.drawings)
        .then(() => {
          console.log("Drawings saved successfully. Cleaning up room:", ws.room);
          if (ws.room) {
            delete rooms[ws.room];
          }
        })
        .catch((error) => {
          console.error("Error saving drawings:", error);
        });
    }
  }
});
});

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("WebSocket server is running");
});