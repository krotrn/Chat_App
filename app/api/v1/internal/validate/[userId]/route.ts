import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const apiKey = req.headers.get("x-internal-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: (await context.params).userId },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, valid: false });
    }

    return NextResponse.json({
      success: true,
      valid: !!user?.emailVerified,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
