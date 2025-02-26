import { db } from "@/prisma";
import { decryptToken } from "@/lib/utils/crypto.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ encodedEmail: string; encodedToken: string }> }
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { encodedEmail, encodedToken } = params;

    if (!encodedEmail || !encodedToken) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    const email = decodeURIComponent(encodedEmail);
    let token: string | null = null;

    try {
      token = await decryptToken(decodeURIComponent(encodedToken));
    } catch (err) {
      console.error("Token Decryption Failed:", err);
      return NextResponse.json(
        { success: false, message: "Invalid or malformed token" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerificationExpiry: true,
        emailVerificationToken: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User Not Found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: true, message: "User already verified" },
        { status: 409 }
      );
    }

    if (user.emailVerificationToken !== token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link",
          reverify: true,
        },
        { status: 400 }
      );
    }

    if (
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code has expired",
          reverify: true,
        },
        { status: 410 }
      );
    }

    const verifiedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationExpiry: null,
        emailVerificationToken: null,
      },
      select: { username: true },
    });

    return NextResponse.json(
      { success: true, message: `${verifiedUser.username} verified.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify email due to server error" },
      { status: 500 }
    );
  }
}
