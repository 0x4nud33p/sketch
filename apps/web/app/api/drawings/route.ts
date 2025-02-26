import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    await prisma.drawing.deleteMany({
      where: { roomId },
    });

    return NextResponse.json({ message: "Canvas cleared successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error clearing canvas:", error);
    return NextResponse.json({ error: "Failed to clear canvas" }, { status: 500 });
  }
}
