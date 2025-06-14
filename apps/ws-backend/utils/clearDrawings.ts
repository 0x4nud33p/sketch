import prisma from "@repo/db/client";

export async function clearRoomDrawings(roomId: string): Promise<void> {
  try {
    await prisma.drawing.deleteMany({
      where: { roomId }
    });
    console.log(`Cleared drawings for room: ${roomId}`);
  } catch (error) {
    console.error("Error clearing drawings:", error);
  }
}