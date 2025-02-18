import { db } from "@/prisma";
import { decryptToken } from "@/utils/crypto.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,{
  params,
}: {
  params:Promise<{ encodedEmail: string; encodedToken: string }>;
}): Promise<NextResponse> {
  const { encodedEmail, encodedToken } = await params;
  const email = decodeURIComponent(encodedEmail);
  const token = await decryptToken(decodeURIComponent(encodedToken));
  try {
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
        {
          success: false,
          message: "User Not Found",
        },
        {
          status: 404,
        }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "User already verified",
        },
        { status: 404 }
      );
    }

    if (user.emailVerificationToken !== token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification Link",
        },
        { status: 404 }
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
        },
        {
          status: 404,
        }
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
      {
          success: true,
          message: `${verifiedUser.username} verified.`,
      },
      {
        status: 202,
      }
    );
  } catch (error) {
    console.log(error)
    if (error instanceof Error && error.message.includes("decryption")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
          success: false,
          message: "Failed to verify email",
      },
      {
        status: 500,
      }
    );
  }
}
