import express, { Request, Response } from "express";
import { Server, WebSocket } from "ws";
import dotenv from "dotenv";

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

interface WebSocketWithRoom extends WebSocket {
  room?: string;
}

interface RoomData {
  clients: Set<WebSocket>;
  drawings: DrawingData[];
}

const rooms: Record<string, RoomData> = {};

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

        // Send previous drawing data to the new client
        ws.send(JSON.stringify({ type: "initial_data", drawings: rooms[room].drawings }));
      }

      if (type === "drawing" && room && drawingData) {
        if (!rooms[room]) return;

        // Store drawing data for new users joining
        rooms[room].drawings.push(drawingData);

        // Broadcast drawing update to all clients in the room
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

  ws.on("close", () => {
    console.log("WebSocket connection closed");

    if (ws.room && rooms[ws.room]) {
      rooms[ws.room]?.clients.delete(ws);

      if (rooms[ws.room]?.clients.size === 0) {
        delete rooms[ws.room]; // Delete empty rooms
      }
    }
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running. WebSocket server is active.");
});
