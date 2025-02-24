import { db } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        email: true,
        isOnline: true,
        role: true,
      },
    });
    return user
      ? NextResponse.json(user)
      : NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
