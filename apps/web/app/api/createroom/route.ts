import prisma from "@repo/db/client";

export default async function handler(req : Request, res : Response) {
  try {
    const newRoom = await prisma.room.create({
      data: {},
    });
    res.status(200).json({ id: newRoom.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
}
