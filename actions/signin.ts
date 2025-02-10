"use server";

import { signIn } from "@/auth";
import { handleAuthError } from "@/lib/chat/Helper";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signInSchema } from "@/schemas/signinSchema";
import { AuthError } from "next-auth";
import { z } from "zod";

export const signin = async (credentials: z.infer<typeof signInSchema>) => {
  const parsedData = signInSchema.safeParse(credentials);

  if (!parsedData.success) {
    return { success: false, message: "Invalid fields" };
  }

  const { identifier, password } = parsedData.data;

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return handleAuthError(error);
    }
    if (typeof error === 'object' && error !== null && 'digest' in error) {
      const digest = (error as { digest?: string }).digest;
      if (digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
      }
    }
    return { 
      success: false, 
      message: "An unexpected error occurred. Please try again." 
    };
  }

  return { success: true, message: "Login successful" };
};