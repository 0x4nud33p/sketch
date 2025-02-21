import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json();

    if (!roomName || typeof roomName !== "string") {
      return NextResponse.json({ error: "Invalid room name" }, { status: 400 });
    }

    const newRoom = await prisma.room.create({
      data: { name: roomName },
    });

    return NextResponse.json({ id: newRoom.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
