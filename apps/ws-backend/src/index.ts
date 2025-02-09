import express from "express";
import { Server } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
});

const wss = new Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");
  //@ts-ignore
  console.log(`socket id: ${ws?._socket._handle.fd}`);
  ws.send("Welcome to the WebSocket server!");

  ws.on("message", (message) => {
    console.log("Received:", message);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

app.get("/", (req, res) => {
  res.send("Server is running. WebSocket server is active.");
});
