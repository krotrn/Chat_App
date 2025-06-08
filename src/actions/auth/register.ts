"use server";

import { hashPassword } from "@/lib/utils/auth.utils";
import { db } from "@/prisma";
import { registerSchema } from "@/schemas/registerSchema";
import { AccountType, UserRoles } from "@prisma/client";
import { createAuthResponse } from "@/types/response-types";
import { handleActionError, sanitizeInput } from "@/lib/utils/utils";

export const registerCredential = async (credentials: {
  email: string;
  username: string;
  password: string;
  confirmpassword: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const sanitizedCredentials = {
      ...credentials,
      email: sanitizeInput(credentials.email).toLowerCase(),
      username: sanitizeInput(credentials.username).toLowerCase(),
    };

    const parsedData = registerSchema.safeParse(sanitizedCredentials);
    if (!parsedData.success) {
      return createAuthResponse(false, parsedData.error.errors[0].message);
    }

    const { email, username, password } = parsedData.data;

    const [existingEmail, existingUsername] = await Promise.all([
      db.user.findFirst({
        where: { AND: [{ email }, { emailVerified: { not: null } }] },
        select: { email: true },
      }),
      db.user.findFirst({
        where: { AND: [{ username }, { emailVerified: { not: null } }] },
        select: { username: true },
      }),
    ]);

    if (existingEmail) {
      return createAuthResponse(false, `${existingEmail.email} already in use`);
    }
    if (existingUsername) {
      return createAuthResponse(
        false,
        `${existingUsername.username} already in use`,
      );
    }

    const newUser = await db.$transaction(async (tx) => {
      await tx.user.deleteMany({
        where: {
          OR: [
            { email, emailVerified: null },
            { username, emailVerified: null },
          ],
        },
      });

      const conflictCount = await tx.user.count({
        where: { OR: [{ email }, { username }] },
      });

      if (conflictCount > 0) {
        throw new Error("Registration conflict after cleanup");
      }

      return await tx.user.create({
        data: {
          email,
          username,
          password: await hashPassword(password),
          role: UserRoles.USER,
          loginType: AccountType.EMAIL,
          emailVerified: null,
        },
        select: { email: true, username: true, id: true },
      });
    });

    if (!newUser) {
      return createAuthResponse(false, "Failed to create user account");
    }

    return createAuthResponse(
      true,
      "Registration successful! Please verify your email.",
    );
  } catch (error) {
    const errorMessage = handleActionError(error, "Registration failed");
    return createAuthResponse(false, errorMessage);
  }
};
