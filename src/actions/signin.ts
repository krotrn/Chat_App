"use server";

import { signIn } from "@/auth";
import { db } from "@/prisma";
import { signInSchema } from "@/schemas/signinSchema";
import { AccountType } from "@prisma/client";
import { z } from "zod";

export const signInCredential = async (
  credentials: z.infer<typeof signInSchema>,
) => {
  const parsedData = signInSchema.safeParse(credentials);

  if (!parsedData.success) {
    return { success: false, message: parsedData.error.errors[0].message };
  }

  const { identifier, password } = parsedData.data;
  try {
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
        NOT: {
          AND: [{ loginType: AccountType.EMAIL }, { emailVerified: null }],
        },
      },
      select: { username: true },
    });

    if (!existingUser) {
      return { success: false, message: "User not Found or Not Verified." };
    }

    const response = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    if (!response || response.error) {
      return {
        success: false,
        message: response?.error || "Authentication failed.",
      };
    }
    return { success: true, message: "Login successful" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error occur in Signing in." };
  }
};
