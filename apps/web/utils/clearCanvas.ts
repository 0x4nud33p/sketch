import axios from "axios";
import React from "react";
import { Drawing } from "@/types";
 
 export const clearCanvas = async ({ roomId, setDrawings, setCurrentDrawing, wsRef } : { roomId : string, setDrawings : (drawings : Drawing[]) => void, setCurrentDrawing : (drawing : Drawing | null) => void, wsRef : React.RefObject<WebSocket> }) => {
    try {
      await axios.delete(`/api/drawings?roomId=${roomId}`);
      setDrawings([]);
      setCurrentDrawing(null);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "clear_canvas",
            room: roomId,
          })
        );
      }
    } catch (error) {
      console.error("Failed to clear canvas", error);
    }
  };