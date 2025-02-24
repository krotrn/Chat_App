import { db } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userIds } = await req.json();
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      avatarUrl: true
    }
  });
  return NextResponse.json({ users });
}

