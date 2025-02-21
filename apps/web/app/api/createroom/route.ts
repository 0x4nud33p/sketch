import prisma from "@repo/db/client";
import { NextApiRequest, NextApiResponse } from "next";

interface RoomResponse {
  id: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RoomResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roomName } = req.body;
    if (!roomName || typeof roomName !== "string") {
      return res.status(400).json({ error: "Invalid room name" });
    }

    const newRoom = await prisma.room.create({
      data: { name: roomName },
    });

    res.status(200).json({ id: newRoom.id });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
}
