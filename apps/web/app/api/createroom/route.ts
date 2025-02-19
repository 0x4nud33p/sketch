import prisma from "@repo/db/client";
import { NextApiRequest, NextApiResponse } from 'next';

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
  try {
    const newRoom = await prisma.room.create({
      data: {},
    });
    res.status(200).json({ id: newRoom.id });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}