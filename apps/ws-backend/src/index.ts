import express, { Request, Response } from "express";
import dotenv from "dotenv";
import prisma from "@repo/db/client";
import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { WebSocketWithRoom, RoomData } from "./types";
import { generateId } from "../utils/generateId";
import { getDrawingsFromDB } from "../utils/getDrawingFromDB";
import { storeDrawingToDb } from "../utils/storeDrawingsToDB";
import { clearRoomDrawings } from "../utils/clearDrawings";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false // Disable compression for better performance
});

const rooms: Record<string, RoomData> = {};

const cleanupInactiveRooms = () => {
  const now = Date.now();
  const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    if (room!.clients.size === 0 && (now - room!.lastActivity) > ROOM_TIMEOUT) {
      console.log(`Cleaning up inactive room: ${roomId}`);
      delete rooms[roomId];
    }
  });
};

// Broadcast to room clients
const broadcastToRoom = (roomId: string, message: any, excludeClient?: WebSocketWithRoom) => {
  const room = rooms[roomId];
  if (!room) return;

  room.clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error broadcasting to client:", error);
        room.clients.delete(client);
      }
    }
  });
};

// Enhanced WebSocket connection handling
wss.on("connection", (ws: WebSocketWithRoom) => {
  ws.id = generateId();
  ws.lastPing = Date.now();
  
  console.log(`New WebSocket connection: ${ws.id}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: "connected",
    clientId: ws.id,
    timestamp: Date.now()
  }));

  ws.on("message", async (message: Buffer) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      const { type, room, drawingData } = parsedMessage;

      switch (type) {
        case "join_room":
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room ID required" }));
            return;
          }

          console.log(`Client ${ws.id} joined room: ${room}`);
          ws.room = room;

          // Initialize room if it doesn't exist
          if (!rooms[room]) {
            rooms[room] = {
              clients: new Set(),
              drawings: [],
              lastActivity: Date.now()
            };
          }

          const roomData = rooms[room];
          roomData.clients.add(ws);
          roomData.lastActivity = Date.now();

          // Send initial drawings
          try {
            const initialDrawings = await getDrawingsFromDB(room);
            ws.send(JSON.stringify({
              type: "initial_drawings",
              data: initialDrawings,
              roomId: room,
              clientCount: roomData.clients.size
            }));

            // Notify other clients about new user
            broadcastToRoom(room, {
              type: "user_joined",
              clientId: ws.id,
              clientCount: roomData.clients.size
            }, ws);
          } catch (error) {
            console.error("Error sending initial drawings:", error);
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Failed to load drawings" 
            }));
          }
          break;

        case "drawing":
          if (!room || !drawingData) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid drawing data" }));
            return;
          }

          if (!rooms[room]) {
            console.warn(`Received drawing for non-existent room: ${room}`);
            return;
          }

          // Add metadata to drawing
          const enhancedDrawing = {
            ...drawingData,
            id: generateId(),
            timestamp: Date.now(),
            clientId: ws.id
          };

          // Store in room memory
          rooms[room].drawings.push(enhancedDrawing);
          rooms[room].lastActivity = Date.now();

          // Store in database asynchronously
          storeDrawingToDb(room, enhancedDrawing).catch(error => {
            console.error("Failed to store drawing in DB:", error);
          });

          // Broadcast to other clients
          broadcastToRoom(room, {
            type: "drawing",
            drawingData: enhancedDrawing
          }, ws);

          console.log(`Drawing received for room ${room} from client ${ws.id}`);
          break;

        case "clear_canvas":
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room ID required" }));
            return;
          }

          if (!rooms[room]) {
            return;
          }

          // Clear room drawings
          rooms[room].drawings = [];
          rooms[room].lastActivity = Date.now();

          // Clear database
          clearRoomDrawings(room).catch(error => {
            console.error("Failed to clear drawings from DB:", error);
          });

          // Broadcast to all clients in room
          broadcastToRoom(room, {
            type: "canvas_cleared",
            clearedBy: ws.id
          });

          console.log(`Canvas cleared for room ${room} by client ${ws.id}`);
          break;

        case "ping":
          ws.lastPing = Date.now();
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;

        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Invalid message format" 
      }));
    }
  });

  // @ts-ignore
  ws.on("close", (code, reason) => {
    console.log(`WebSocket connection closed: ${ws.id}, code: ${code}, reason: ${reason.toString()}`);
    
    if (ws.room && rooms[ws.room]) {
      const room = rooms[ws.room];
      room!.clients.delete(ws);

      // Notify other clients about user leaving
      broadcastToRoom(ws.room, {
        type: "user_left",
        clientId: ws.id,
        clientCount: room!.clients.size
      });

      // If room is empty, clean up after delay
      if (room!.clients.size === 0) {
        console.log(`Room ${ws.room} is empty, will clean up after delay`);
        setTimeout(() => {
          // @ts-ignore
          if (rooms[ws.room!] && rooms[ws.room].clients.size === 0) {
            console.log(`Cleaning up empty room: ${ws.room}`);
            delete rooms[ws.room!];
          }
        }, 5000); // 5 second delay
      }
    }
  });
  // @ts-ignore
  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${ws.id}:`, error);
  });

  // Send ping every 30 seconds to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);

  // @ts-ignore
  ws.on("pong", () => {
    ws.lastPing = Date.now();
  });
});

// Cleanup inactive rooms every 10 minutes
setInterval(cleanupInactiveRooms, 10 * 60 * 1000);

// REST API endpoints
app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "WebSocket drawing server is running",
    rooms: Object.keys(rooms).length,
    connections: Array.from(Object.values(rooms)).reduce((total, room) => total + room.clients.size, 0),
    timestamp: new Date().toISOString()
  });
});

// Get room info
// @ts-ignore
app.get("/room/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const room = rooms[roomId!];
  
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    roomId,
    clientCount: room.clients.size,
    drawingCount: room.drawings.length,
    lastActivity: room.lastActivity
  });
});

// Clear room drawings (REST endpoint)
// @ts-ignore
app.delete("/api/drawings", async (req: Request, res: Response) => {
  const { roomId } = req.query;
  
  if (!roomId || typeof roomId !== 'string') {
    return res.status(400).json({ error: "Room ID required" });
  }

  try {
    await clearRoomDrawings(roomId);
    
    // Clear in-memory drawings
    if (rooms[roomId]) {
      rooms[roomId].drawings = [];
    }

    res.json({ success: true, message: "Drawings cleared" });
  } catch (error) {
    console.error("Error clearing drawings:", error);
    res.status(500).json({ error: "Failed to clear drawings" });
  }
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error("Express error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}`);
});