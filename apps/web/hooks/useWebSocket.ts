// useWebSocket.ts - Custom hook for WebSocket logic
import { useEffect, useRef, useState } from 'react';
import { Drawing, WSMessage } from '../../web/app/canvas/types';

interface UseWebSocketProps {
  roomId: string;
  onInitialDrawings: (drawings: Drawing[]) => void;
  onNewDrawing: (drawing: Drawing) => void;
}

export const useWebSocket = ({ 
  roomId, 
  onInitialDrawings, 
  onNewDrawing 
}: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "join_room", room: roomId }));
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        
        switch (message.type) {
          case "initial_drawings":
            if (Array.isArray(message.data)) {
              onInitialDrawings(message.data);
            } else {
              console.error("Invalid initial_drawings data:", message.data);
            }
            break;
            
          case "drawing":
            if (message.drawingData) {
              onNewDrawing(message.drawingData);
            } else {
              console.error("Invalid drawing data:", message);
            }
            break;
            
          default:
            console.log("Unhandled message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, onInitialDrawings, onNewDrawing]);

  const sendDrawing = (drawing: Drawing) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "drawing",
          room: roomId,
          drawingData: drawing,
        })
      );
    }
  };

  return { sendDrawing, isConnected };
};