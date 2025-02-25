import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma";
import redisClient from "@/lib/redis";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const apiKey = req.headers.get("x-internal-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const cached = await redisClient.get(`user:${params.userId}`);
    if (cached) {
      return NextResponse.json({ success: true, valid: true });
    }

    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: { id: true, emailVerified: true }
    });

    if (!user) {
      return NextResponse.json({ success: true, valid: false });
    }

    if (user.emailVerified) {
      await redisClient.set(`user:${params.userId}`, "1", { EX: 300 });
    }

    return NextResponse.json({ 
      success: true, 
      valid: !!user?.emailVerified 
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}