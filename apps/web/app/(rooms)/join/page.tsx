"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { toast } from "sonner";
import axios from "axios";

interface Room {
  id: string;
  name: string;
  createdAt: string;
}

export default function JoinRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get<{ rooms: Room[] }>("/api/rooms");
        setRooms(data.rooms);
      } catch (error) {
        toast.error("Failed to fetch rooms.");
      }
    };
    fetchRooms();
  }, []);

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

      if (!response.ok) throw new Error("Failed to create room");

      const { id }: { id: string } = await response.json();
      setRooms([...rooms, { id, name: newRoomName, createdAt: new Date().toISOString() }]);
      toast.success("Room created successfully.");
      setShowPopup(false);
      setNewRoomName("");
    } catch (error) {
      toast.error("Failed to create room.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#18181b] text-white">
      <Card className="w-[95%] md:w-[50vw] p-5 bg-[#27272a]">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Available Rooms</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
          ))}
        </CardContent>
        <div className="mt-6 flex justify-center">
          <Button className="bg-[#fef08a] text-black px-6 py-3 rounded-lg" onClick={() => setShowPopup(true)}>
            Create Room
          </Button>
        </div>
      </Card>

      {showPopup && <RoomCreationPopup onCreate={handleCreateRoom} onCancel={() => setShowPopup(false)} newRoomName={newRoomName} setNewRoomName={setNewRoomName} />}
    </div>
  );
}

function RoomCard({ room, onJoin }: { room: Room; onJoin: (roomId: string) => void }) {
  return (
    <Card className="bg-[#3b3b40] text-white p-4 rounded-lg cursor-pointer hover:shadow-lg hover:bg-[#323236]" onClick={() => onJoin(room.id)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-400">Created on {new Date(room.createdAt).toLocaleDateString()}</CardContent>
    </Card>
  );
}

function RoomCreationPopup({
  onCreate,
  onCancel,
  newRoomName,
  setNewRoomName,
}: {
  onCreate: () => void;
  onCancel: () => void;
  newRoomName: string;
  setNewRoomName: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-[90%] md:w-[30vw] bg-[#27272a] p-5">
        <CardHeader>
          <CardTitle className="text-center">Create a Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Enter Room Name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="w-full p-2 rounded-lg bg-[#3f3f46] text-white border border-gray-600"
          />
          <Button className="w-full bg-[#fef08a] text-black px-4 py-2 rounded-lg" onClick={onCreate}>
            Create
          </Button>
          <Button className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg" onClick={onCancel}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
