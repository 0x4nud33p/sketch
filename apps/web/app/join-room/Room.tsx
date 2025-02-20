"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";

export default function Room() {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a valid Room ID.");
      return;
    }

    setLoading(true);
    try {
      toast.success(`Joined room: ${roomId}`);
      router.push(`/canvas?roomid=${encodeURIComponent(roomId)}`);
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/createroom",{});
      router.push(`/canvas?roomid=${encodeURIComponent(data.id)}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-[#18181b] items-center min-h-screen w-full fixed top-0 left-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-50"
      >
        <Card className="w-[95%] mx-auto md:w-[22vw] shadow-sm md:shadow-lg bg-[#27272a] text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="md:text-2xl text-xl font-bold text-center">
              Join or Create Room
            </CardTitle>
            <CardDescription className="text-center">
              Enter a Room ID to join or create a new room.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#3f3f46] text-white border border-gray-600"
            />
            <Button
              className="w-full bg-[#fef08a] text-black border border-black p-3 rounded-lg flex items-center justify-center hover:bg-[#fef08a]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleJoinRoom}
              disabled={loading || !roomId.trim()}
            >
              {loading ? "Joining..." : "Join Room"}
            </Button>
            <Button
              className="w-full bg-[#4caf50] text-white border border-black p-3 rounded-lg flex items-center justify-center hover:bg-[#4caf50]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateRoom}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
