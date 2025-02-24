import { db } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ valid: false });

  const user = await db.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ valid: !!user });
}
