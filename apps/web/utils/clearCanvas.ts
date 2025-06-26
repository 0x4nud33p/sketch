import axios from "axios";
 
 export const clearCanvas = async ({ roomId } : { roomId : string }) => {
    try {
      await axios.delete(`/api/drawings?roomId=${roomId}`);
    } catch (error) {
      console.error("Failed to clear canvas", error);
    }
  };