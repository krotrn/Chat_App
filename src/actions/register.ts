"use server";

import { hashPassword } from "@/lib/utils/auth.utils";
import { db } from "@/prisma";
import { registerSchema } from "@/schemas/registerSchema";
import { AccountType, Prisma, UserRoles } from "@prisma/client";

export const registerCredential = async (credentials: {
  email: string;
  username: string;
  password: string;
  confirmpassword: string;
}): Promise<{
  success: boolean;
  message: string;
}> => {
  const parsedData = registerSchema.safeParse(credentials);
  if (!parsedData.success) {
    return { success: false, message: parsedData.error.errors[0].message };
  }
  const { email, username, password } = parsedData.data;

  try {
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
      return {
        success: false,
        message: `${existingEmail.email} already in use`,
      };
    } else if (existingUsername) {
      return {
        success: false,
        message: `${existingUsername.username} already in use`,
      };
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

      const userAvailable = await tx.user.count({
        where: { OR: [{ email }, { username }] },
      });

      if (userAvailable) {
        throw new Error("Registration conflict");
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
        select: { email: true },
      });
    });
    if (!newUser) {
      return {
        success: false,
        message: "error creating user",
      };
    }
    return {
      success: true,
      message: "Registration successful! Please verify your email.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const targetField = (error.meta?.target as string[])?.[0] ?? "field";
      return {
        success: false,
        message: `Registration conflict: ${targetField} already in use.`,
      };
    }
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Error creating user. Please try again later.",
    };
  }
};
