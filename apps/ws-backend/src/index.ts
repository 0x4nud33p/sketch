import express from "express";
import { Server } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
});

// Create a WebSocket server attached to the Express HTTP server
const wss = new Server({ server });

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Send a welcome message to the connected client
  ws.send("Welcome to the WebSocket server!");

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    console.log("Received:", message);
    ws.send(`Echo: ${message}`);
  });

  // Handle WebSocket close event
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

// Express route to check if the server is running
app.get("/", (req, res) => {
  res.send("Server is running. WebSocket server is active.");
});
