"use client";

import { toast } from "sonner";
import { useCallback, useRef, useState } from "react";
import { Drawing } from "@/types/index"


type ConnectionStatus = "connected" | "disconnected" | "connecting";

export const useConnectWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [drawings, setDrawings] = useState<Drawing[]>([]);

  const connectWebSocket = useCallback((roomId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;
    setConnectionStatus("connecting");

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnectionStatus("connected");
      ws.send(JSON.stringify({ type: "join_room", room: roomId }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📬 WebSocket message received:", data);
        if (data.type === "initial_drawings" && Array.isArray(data.data)) {
          setDrawings(data.data);
        } else if (data.type === "drawing" && data.drawingData) {
          setDrawings((prev) => [...prev, data.drawingData]);
        } else {
          console.error("🚫 Invalid message format:", data);
        }
      } catch (err) {
        console.error("❌ Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("⚠️ WebSocket closed:", event.code, event.reason);
      setConnectionStatus("disconnected");

      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔁 Reconnecting...");
          connectWebSocket(roomId);
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      toast.error("WebSocket Connection error");
      setConnectionStatus("disconnected");
    };
  }, []);

  return {
    connectWebSocket,
    connectionStatus,
    setDrawings,
    drawings,
  };
};
