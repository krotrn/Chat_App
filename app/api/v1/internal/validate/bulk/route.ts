import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-internal-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", users: [] },
      { status: 401 }
    );
  }

  const response = await req.json();

  const { userIds } = response as { userIds: string[] };

  try {
    const users = await Promise.all(
      userIds.map(async (userId: string) => {
        return await db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            emailVerified: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        });
      })
    );
    const nonNullUser = users.filter((user) => user !== null);
    const validUsers = nonNullUser.filter(
      (user) => user.emailVerified !== null
    );

    return NextResponse.json({
      success: true,
      message: "Users found",
      users: validUsers.map((user) => ({
        id: user.id,
        fullName: user.name || user.username,
        avatar: user.avatarUrl,
      })),
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { success: false, message: "Unauthorized", users: [] },
      { status: 401 }
    );
  }
}
