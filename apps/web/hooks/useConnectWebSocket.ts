import { useCallback, useEffect, useRef, useState } from "react";
import { Drawing, ConnectionStatus, WebSocketMessage } from "@/types";

interface UseWebSocketOptions {
  url: string;
  roomId: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export const useWebSocket = ({
  url,
  roomId,
  onMessage,
  onError,
  reconnectAttempts = 5,
  reconnectDelay = 3000,
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Component cleanup");
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    cleanup();
    setConnectionStatus("connecting");

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setConnectionStatus("connected");
        reconnectCountRef.current = 0;
        
        // Join room immediately after connection
        ws.send(JSON.stringify({ type: "join_room", room: roomId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("⚠️ WebSocket closed:", event.code, event.reason);
        setConnectionStatus("disconnected");

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔁 Reconnecting... (${reconnectCountRef.current}/${reconnectAttempts})`);
            connect();
          }, reconnectDelay * reconnectCountRef.current);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          setConnectionStatus("error");
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionStatus("error");
        onError?.(error);
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      setConnectionStatus("error");
    }
  }, [url, roomId, onMessage, onError, reconnectAttempts, reconnectDelay, cleanup]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error("❌ Error sending WebSocket message:", error);
        return false;
      }
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionStatus("disconnected");
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    connect,
    disconnect,
    sendMessage,
    connectionStatus,
    isConnected: connectionStatus === "connected",
  };
};