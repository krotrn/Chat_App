"use server";

import EmailTemplate from "@/components/auth/EmailTemplate";
import { config } from "@/config";
import { decryptToken, encryptToken } from "@/lib/utils/crypto.utils";
import { db } from "@/prisma";
import { Resend } from "resend";
import { v4 } from "uuid";
import { createAuthResponse } from "../../types/response-types";
import { handleActionError, sanitizeInput } from "../../lib/utils/utils";

const generateVerificationToken = async (email: string) => {
  try {
    const emailVerificationToken = v4();
    const expirationTime = config.emailTokenExpirationTime;

    const emailVerificationExpiry = new Date(
      Date.now() + expirationTime * 60 * 1000,
    );

    const user = await db.user.update({
      where: { email },
      data: {
        emailVerificationToken,
        emailVerificationExpiry,
      },
      select: { emailVerificationToken: true },
    });

    return { success: true, token: user.emailVerificationToken };
  } catch (error) {
    console.error("Token generation error:", error);
    return { success: false, token: null };
  }
};

export const sendVerificationEmail = async (
  to: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const sanitizedEmail = sanitizeInput(to).toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return createAuthResponse(false, "Invalid email format");
    }

    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
      select: { emailVerified: true },
    });

    if (!existingUser) {
      return createAuthResponse(false, "User not found");
    }

    if (existingUser.emailVerified) {
      return createAuthResponse(false, "Email is already verified");
    }

    const response = await generateVerificationToken(sanitizedEmail);
    if (!response.success || !response.token) {
      return createAuthResponse(false, "Failed to generate verification token");
    }

    const encryptedToken = await encryptToken(response.token);
    const verificationLink = `${config.baseUrl}/auth/verify?email=${encodeURIComponent(
      sanitizedEmail,
    )}&token=${encodeURIComponent(encryptedToken)}`;

    const resend = new Resend(config.resendApiKey);
    const { error } = await resend.emails.send({
      from: config.resendFromEmail,
      to: sanitizedEmail,
      subject: `Verify Your Email - ${config.appName}`,
      react: EmailTemplate({
        verificationLink,
        expirationHours: String(config.emailTokenExpirationTime),
      }),
    });

    if (error) {
      console.error("Email sending error:", error);
      return createAuthResponse(false, "Failed to send verification email");
    }

    return createAuthResponse(
      true,
      "Verification email sent. Please check your inbox.",
    );
  } catch (error) {
    const errorMessage = handleActionError(
      error,
      "Failed to send verification email",
    );
    return createAuthResponse(false, errorMessage);
  }
};

export const verifyEmailAction = async ({
  email,
  encryptedToken,
}: {
  email: string;
  encryptedToken: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedToken = sanitizeInput(encryptedToken);

    if (!sanitizedEmail || !sanitizedToken) {
      return createAuthResponse(false, "Invalid verification parameters");
    }

    const decryptedToken = await decryptToken(sanitizedToken);
    if (!decryptedToken) {
      return createAuthResponse(false, "Invalid verification token");
    }

    const user = await db.user.findFirst({
      where: {
        AND: [
          { email: sanitizedEmail },
          { emailVerificationToken: decryptedToken },
          { emailVerificationExpiry: { gt: new Date() } },
        ],
      },
      select: {
        emailVerified: true,
        username: true,
      },
    });

    if (!user) {
      return createAuthResponse(
        false,
        "Invalid or expired verification token. Please request a new one.",
      );
    }

    if (user.emailVerified) {
      return createAuthResponse(false, "Email is already verified");
    }

    const verifiedUser = await db.user.update({
      where: { email: sanitizedEmail },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
      select: {
        username: true,
      },
    });

    return createAuthResponse(
      true,
      `Welcome ${verifiedUser.username}! Your email has been verified.`,
    );
  } catch (error) {
    const errorMessage = handleActionError(error, "Email verification failed");
    return createAuthResponse(false, errorMessage);
  }
};
