import express from "express";
import { Request, Response } from "express";
import { Server } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
});

const wss = new Server({ server });

const rooms: { [key: string]: Set<any> } = {};

wss.on("connection", (ws) => {
  console.log("New WebSocket connection", ws.listeners);

  ws.on("message", (message) => {
    console.log("Received:", message);
    const parsedMessage = JSON.parse(message.toString());
    const { room, drawingData } = parsedMessage;
    if (room && drawingData) {
      if (rooms[room]) {
        rooms[room].forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(JSON.stringify({ drawingData }));
          }
        });
      }
    }
  });

  ws.on("join_room", (room: string) => {
    console.log(`Joining room: ${room}`);

    if (!rooms[room]) {
      rooms[room] = new Set();
    }
    rooms[room].add(ws);

    ws.send(JSON.stringify({ message: `Joined room: ${room}` }));

    rooms[room].forEach((client) => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(JSON.stringify({ message: `${ws.url} has joined the room` }));
      }
    });
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");

    Object.keys(rooms).forEach((room) => {
      rooms[room]!.delete(ws);

      if (rooms[room]!.size === 0) {
        delete rooms[room];
      }
    });
  });
});

app.get("/", (req : Request, res : Response) => {
  res.send("Server is running. WebSocket server is active.");
});
