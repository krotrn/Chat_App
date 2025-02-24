import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma";
import { v4 as uuidv4 } from "uuid";
import { config } from "@/config";

/**
 * This endpoint creates a new email verification token
 * and saves it along with its expiration in the user's record.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await request.json();
    const token = uuidv4();
    const expirationTime = config.emailTokenExpirationTime // in hours
    const expireDate = new Date(Date.now() + expirationTime * 3600 * 1000);

    // Update user record with the token and expiration time
    const user = await db.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: expireDate,
      },
    });

    return NextResponse.json({
      success: true,
      token: user.emailVerificationToken,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Error generating verification token" },
      { status: 500 }
    );
  }
}
