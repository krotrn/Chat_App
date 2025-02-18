import { db } from "@/prisma";
import { decryptToken } from "@/utils/crypto.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ encodedEmail: string; encodedToken: string }> }
): Promise<NextResponse> {
  try {
    // ✅ Await params
    const params = await context.params;
    const { encodedEmail, encodedToken } = params;

    if (!encodedEmail || !encodedToken) {
      return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
    }

    // ✅ Decode and decrypt safely
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

    // ✅ Find user
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
      return NextResponse.json({ success: false, message: "User Not Found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "User already verified" },
        { status: 409 }
      );
    }

    // ✅ Check token validity
    if (user.emailVerificationToken !== token) {
      return NextResponse.json(
        { success: false, message: "Invalid verification link" },
        { status: 400 }
      );
    }

    // ✅ Check expiration
    if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "Verification code has expired" },
        { status: 410 }
      );
    }

    // ✅ Mark user as verified
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
