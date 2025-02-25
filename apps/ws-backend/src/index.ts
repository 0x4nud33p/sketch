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
  [key: string]: any;
}

interface WebSocketWithRoom extends WebSocket {
  room?: string;
}

interface RoomData {
  clients: Set<WebSocket>;
  drawings: Drawing[];
}

const rooms: Record<string, RoomData> = {};

async function getDrawingsFromDB(roomId: string) {
  try {
    const drawings = await prisma.drawing.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });

    console.log("Fetched Drawings:", drawings);
    return drawings;
  } catch (error) {
    console.error("Error fetching drawings:", error);
    return [];
  }
}


async function storeDrawingsToDb(roomId: string, drawings: Drawing[]) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });
    console.log("room found to store in db",room);
    if (!room) {
      console.log("Room not found!");
      return;
    }

    const formattedDrawings = drawings.map((drawing) => ({
      roomId: roomId,
      points: drawing.points ? drawing.points : undefined,
      startX: drawing.startX ?? null,
      startY: drawing.startY ?? null,
      width: drawing.width ?? null,
      height: drawing.height ?? null,
      centerX: drawing.centerX ?? null,
      centerY: drawing.centerY ?? null,
      radius: drawing.radius ?? null,
      color: drawing.color,
      size: drawing.width ?? drawing.radius ?? 10,
    }));
    console.log("fomrateddrawing before storing dn db:",formattedDrawings);
    
    await prisma.drawing.createMany({
      data: formattedDrawings,
    });

    console.log("Drawings stored successfully.");
  } catch (error) {
    console.error("Error storing drawings:", error);
  }
}

wss.on("connection", (ws: WebSocketWithRoom) => {
  console.log("New WebSocket connection");

  ws.on("message", async (message: string) => {
    try {
      const parsedMessage: { type: string; room?: string; drawingData?: Drawing } = JSON.parse(message);
      const { type, room, drawingData } = parsedMessage;

      if (type === "join_room" && room) {
        console.log(`Client joined room: ${room}`);

        if (!rooms[room]) {
          rooms[room] = { clients: new Set(), drawings: [] };
        }

        rooms[room].clients.add(ws);
        ws.room = room;

        try {
          const initialData = await getDrawingsFromDB(room);
          ws.send(JSON.stringify({ type: "initial_drawings", data: initialData }));
        } catch (error) {
          console.error("Error sending initial drawings:", error);
        }
      }

      if (type === "drawing" && room && drawingData) {
        console.log("Drawing received for room:", room);
        console.log("drawing data inside drawing ws",drawingData);
        if (!rooms[room]) {
          console.warn(`Room ${room} does not exist`);
          return;
        }

        rooms[room].drawings.push(drawingData);

        rooms[room].clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "drawing", drawingData }));
          }
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", async () => {
    console.log("WebSocket connection closed");

    if (ws.room && rooms[ws.room]) {
      if (rooms[ws.room]?.clients.size === 1) {
        console.log(`Storing drawings for room ${ws.room} before closing.`);
        await storeDrawingsToDb(ws.room, rooms[ws.room]?.drawings ?? []);
      }

      rooms[ws.room]?.clients.delete(ws);

      if (rooms[ws.room]?.clients.size === 0) {
        delete rooms[ws.room];
      }
    }
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running. WebSocket server is active.");
});
