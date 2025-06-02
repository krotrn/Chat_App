"use server";

import EmailTemplate from "@/components/auth/EmailTemplate";
import { config } from "@/config";
import { decryptToken, encryptToken } from "@/lib/utils/crypto.utils";
import { db } from "@/prisma";
import { Resend } from "resend";
import { v4 } from "uuid";

const generateVerificationToken = async (email: string) => {
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
};

export const sendVerificationEmail = async (to: string) => {
  const response = await generateVerificationToken(to);
  const encryptedToken = await encryptToken(response.token!);
  const verificationLink = `${config.baseUrl}/auth/verify?email=${encodeURIComponent(
    to,
  )}&token=${encodeURIComponent(encryptedToken)}`;

  const resend = new Resend(config.resendApiKey);
  const { error } = await resend.emails.send({
    from: config.resendFromEmail,
    to,
    subject: `Verify Your Email - ${config.appName}`,
    react: EmailTemplate({
      verificationLink,
      expirationHours: String(config.emailTokenExpirationTime),
    }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { message: "Check Your Email", success: true };
};

export const verifyEmailAction = async ({
  email,
  encryptedToken,
}: {
  email: string;
  encryptedToken: string;
}) => {
  const decryptedToken = await decryptToken(encryptedToken);

  const user = await db.user.findFirst({
    where: {
      AND: [
        { email },
        { emailVerificationToken: decryptedToken },
        { emailVerificationExpiry: { gt: new Date() } },
      ],
    },
    select: {
      emailVerified: true,
    },
  });

  if (!user) {
    return { success: false, message: "Resend the Email." };
  }

  if (user.emailVerified) {
    return { success: false, message: "User already verified." };
  }

  const verifiedUser = await db.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
    select: {
      username: true,
    },
  });
  return { success: true, message: `${verifiedUser.username} is verified.` };
};
