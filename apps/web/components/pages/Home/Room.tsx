"use client";

import { useState, useEffect, useRef } from "react";

interface DrawingData {
  x: number;
  y: number;
}

interface WebSocketMessage {
  room?: string;
  message?: string;
  drawingData?: DrawingData;
}

export default function Room() {
  const [roomName, setRoomName] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const wsUrl = "ws://localhost:3004";
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
      if (roomName) {
        joinRoom(roomName);
      }
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("Received:", message);
        setMessages((prevMessages) => [...prevMessages, message]);

        if (message.drawingData) {
          draw(message.drawingData);
        } else if (message.message) {
          console.log("System Message:", message.message);
        }
      } catch (error) {
        console.error("Error parsing message:", error, event.data);
      }
    };

    ws.current.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
      ws.current = null;
      setTimeout(connectWebSocket, 3000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const joinRoom = (room: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const joinMessage: WebSocketMessage = { room, message: "join_room" };
      ws.current.send(JSON.stringify(joinMessage));
    } else {
      console.error("WebSocket connection is not open.");
    }
  };

  const handleRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (roomName && ws.current && ws.current.readyState === WebSocket.OPEN) {
      joinRoom(roomName);
    }
  };

  const sendDrawingData = (drawingData: DrawingData) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { room: roomName, drawingData };
      ws.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket connection is not open.");
    }
  };

  const draw = (drawingData: DrawingData) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(drawingData.x, drawingData.y, 5, 5);
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      sendDrawingData({ x, y });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          required
          className="p-2 bg-gray-400 rounded-lg mr-2"
          placeholder="Enter room name"
          value={roomName}
          onChange={handleRoomNameChange}
        />
        <button
          type="submit"
          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
          disabled={!isConnected}
        >
          Join Room
        </button>
      </form>

      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="border border-black"
        onClick={handleCanvasClick}
      />
    </div>
  );
}
