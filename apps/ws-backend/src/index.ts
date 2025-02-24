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

interface DrawingData {
  x: number;
  y: number;
  color: string;
  size: number;
  [key: string]: any;
}

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
}

interface WebSocketWithRoom extends WebSocket {
  room?: string;
}

interface RoomData {
  clients: Set<WebSocket>;
  drawings: DrawingData[];
}

const rooms: Record<string, RoomData> = {};

async function getDrawingsFromDB(roomId: string) {
  try {
    const drawings = await prisma.drawing.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });
    return drawings;
  } catch (error) {
    console.error("Error fetching drawings:", error);
    return [];
  }
}

async function storeDrawingsToDb(roomId: string, drawings: Drawing) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      console.log("Room not found!");
      return;
    }

    await prisma.drawing.create({
      data: drawings
    });

    console.log("Drawings stored successfully.");
  } catch (error) {
    console.error("Error storing drawings:", error);
  }
}


wss.on("connection", (ws: WebSocketWithRoom) => {
  console.log("New WebSocket connection");

  ws.on("message", (message: string) => {
    try {
      const parsedMessage: { type: string; room?: string; drawingData?: DrawingData } = JSON.parse(message);
      const { type, room, drawingData } = parsedMessage;

      if (type === "join_room" && room) {
        console.log(`Client joined room: ${room}`);

        if (!rooms[room]) {
          rooms[room] = { clients: new Set(), drawings: [] };
        }

        rooms[room].clients.add(ws);
        ws.room = room;
        
        getDrawingsFromDB(room).then((initialDrawings) => {
          ws.send(JSON.stringify({ type: "initial_data", drawings: initialDrawings }));
        }).catch((error) => {
          console.error("Error fetching drawings:", error);
        });

        rooms[room].clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "user_joined", room }));
          }
        });
      }
      if (type === "drawing" && room && drawingData) {
        console.log("rooms",rooms);
        if (!rooms[room]) return;
        if (!rooms[room]) {
          console.warn(`Room ${room} does not exist`);
          return;
        }
        rooms[room].drawings.push(drawingData);
        rooms[room].clients.forEach((client) => {
          // if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "drawing", drawingData }));
          }
        });
      }
      if(room && drawingData){
        storeDrawingsToDb(room,drawingData);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");

    if (ws.room && rooms[ws.room]) {
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
