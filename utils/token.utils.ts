import { ApiError } from "@/lib/api/ApiError";
import { db } from "@/prisma";
import { v4 as uuidv4 } from "uuid";
import { decryptToken } from "./crypto.utils";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expire = new Date(new Date().getTime() + 3600 * 100);
  try {
    const user = await db.user.update({
      where: { email },
      data: { emailVerificationToken: token, emailVerificationExpiry: expire },
    });
    return user.emailVerificationToken;
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: "Error creating Verification token",
    });
  }
};

export const verifyToken = async (
  email: string,
  code: string,
  isEncrypted: boolean = false
) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true,
        emailVerified: true,
        role: true,
      },
    });

    if (!user) return { error: "User not found" };
    if (user.emailVerified) return { error: "Email already verified" };

    const verificationCode = isEncrypted ? decryptToken(code) : code;

    if (user.emailVerificationToken !== verificationCode) {
      return { error: "Invalid verification code" };
    }

    if (
      !user.emailVerificationExpiry ||
      user.emailVerificationExpiry < new Date()
    ) {
      return { error: "Verification code has expired" };
    }

    await db.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    return {
      success: "Email verified successfully"
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("decryption")) {
      return { error: "Invalid verification link" };
    }

    return { error: "Failed to verify email" };
  }
};
