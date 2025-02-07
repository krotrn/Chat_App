"use server";

import { signIn } from "@/auth";
import { ApiError } from "@/lib/api/ApiError";
import { handleAuthError } from "@/lib/chat/Helper";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signInSchema } from "@/schemas/signinSchema";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

export const signin = async (credentials: z.infer<typeof signInSchema>) => {
  const parsedData = signInSchema.safeParse(credentials);

  if (!parsedData.success) {
    return { success: false, message: "Invalid fields" };
  }

  const { email, password, username } = parsedData.data;

  try {
    await signIn("credentials", {
      email,
      username,
      password,
    });
    redirect(DEFAULT_LOGIN_REDIRECT);
  } catch (error) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    // Handle Next.js redirect errors
    if (typeof error === 'object' && error !== null && 'digest' in error) {
      const digest = (error as { digest?: string }).digest;
      if (digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
    }
    throw new ApiError({ statusCode: 500, message: "Something went wrong", data: error });
  }
};