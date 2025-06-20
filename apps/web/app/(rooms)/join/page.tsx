"use client";

import axios from "axios";
import { toast } from "sonner";
import { Room } from "@/types/index";
import RoomCard from "utils/RoomCard";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RoomCreationPopup from "@/modals/RoomCreationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export default function JoinRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<{ rooms: Room[] }>("/api/rooms");
      setRooms(data.rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleJoinRoom = (roomId: string) => {
    router.push(`/canvas?roomid=${encodeURIComponent(roomId)}`);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Room name cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: newRoomName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { id }: { id: string } = await response.json();
      setRooms((prevRooms) => [
        ...prevRooms,
        {
          id,
          name: newRoomName,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success("Room created successfully!");
      setShowPopup(false);
      setNewRoomName("");
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <Card className="w-full max-w-4xl bg-zinc-800 border-zinc-700">
        <CardHeader className="border-b border-zinc-700">
          <CardTitle className="text-2xl font-bold text-center">
            Available Rooms
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No rooms available. Create your first room!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              className="bg-yellow-200 hover:bg-yellow-300 text-zinc-900 font-medium px-6 py-3 rounded-lg transition-colors"
              onClick={() => setShowPopup(true)}
            >
              Create New Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPopup && (
        <RoomCreationPopup
          onCreate={handleCreateRoom}
          onCancel={() => {
            setShowPopup(false);
            setNewRoomName("");
          }}
          newRoomName={newRoomName}
          setNewRoomName={setNewRoomName}
        />
      )}
    </div>
  );
}

