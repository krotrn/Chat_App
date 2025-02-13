import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { db } from "@/prisma";
import { decryptToken } from "@/utils/crypto.utils";
import { NextResponse } from "next/server";

/**
 * Handles the POST request for email verification.
 *
 * @param {Object} params - The request parameters.
 * @param {string} params.encodedEmail - The encoded email of the user.
 * @param {string} params.encodedToken - The encoded verification token.
 * @returns {Promise<NextResponse>} The response object containing the verification result.
 *
 * @throws {ApiError} If the user is not found, already verified, the verification code is invalid or expired, or if there is a decryption error.
 */
export async function POST({
  params,
}: {
  params: { encodedEmail: string; encodedToken: string };
}): Promise<NextResponse> {
  const { encodedEmail, encodedToken } = params;
  const email = decodeURIComponent(encodedEmail);
  const encryptedToken = decodeURIComponent(encodedToken);
  const token = decryptToken(encryptedToken);
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
        new ApiError({ statusCode: 404, message: "User Not Found" }).toJSON()
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        new ApiError({
          statusCode: 404,
          message: "User already verified",
        }).toJSON()
      );
    }

    if (user.emailVerificationToken !== token) {
      return NextResponse.json(
        new ApiError({
          statusCode: 404,
          message: "Invalid verification code",
        }).toJSON()
      );
    }
    if (
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date()
    ) {
      return NextResponse.json(
        new ApiError({
          statusCode: 404,
          message: "Verification code has expired",
        }).toJSON()
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
      new ApiResponse({
        statusCode: 404,
        message: `${verifiedUser} verified.`,
      }).toJSON()
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("decryption")) {
      return NextResponse.json(
        new ApiError({
          statusCode: 404,
          message: "Invalid verification link",
        }).toJSON()
      );
    }

    return NextResponse.json(
      new ApiError({
        statusCode: 404,
        message: "Failed to verify email",
      }).toJSON()
    );
  }
}
