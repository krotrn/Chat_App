"use server";
import { registerSchema } from "@/schemas/registerSchema";
import { UserRoles, AccountType } from "@prisma/client";
import { z } from "zod";
import { db } from "@/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hashPassword } from "@/utils/auth.utils";

export const register = async (credentials: z.infer<typeof registerSchema>) => {
  const parsedData = registerSchema.safeParse(credentials);
  if (!parsedData.success) {
    return { error: "Invalid field values." };
  }

  const { email, username, password } = parsedData.data;

  try {
    const [existingEmail, existingUsername] = await Promise.all([
      db.user.findUnique({
        where: { email },
        select: { emailVerified: true },
      }),
      db.user.findUnique({
        where: { username },
        select: { emailVerified: true },
      }),
    ]);

    // Handle verified account conflicts
    if (existingEmail?.emailVerified) {
      return { error: "Email already in use" };
    }
    if (existingUsername?.emailVerified) {
      return { error: "Username already taken" };
    }

    await db.$transaction(async (tx) => {
      // Cleanup unverified conflicts
      await Promise.all([
        tx.user.deleteMany({
          where: {
            OR: [
              { email, emailVerified: null },
              { username, emailVerified: null },
            ],
          },
        }),
      ]);

      const [emailAvailable, usernameAvailable] = await Promise.all([
        tx.user.count({ where: { email } }),
        tx.user.count({ where: { username } }),
      ]);

      if (emailAvailable > 0 || usernameAvailable > 0) {
        throw new Error("Registration conflict detected");
      }

      // Create verified user
      return tx.user.create({
        data: {
          email,
          username,
          password: await hashPassword(password),
          role: UserRoles.USER,
          loginType: AccountType.EMAIL,
          emailVerified: null,
          emailVerificationExpiry: new Date(Date.now() + 3600 * 1000),
        },
        select: { email: true },
      });
    });

    // TODO: Implement email verification trigger
    return {
      success: "Registration successful. Please verify your email.",
    };
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "Duplicate registration attempt detected" };
      }
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete registration",
    };
  }
};
