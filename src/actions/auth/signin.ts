"use server";

import { signIn } from "@/auth";
import { signInSchema } from "@/schemas/signinSchema";
import { AuthError } from "next-auth";
import { z } from "zod";
import { createAuthResponse } from "../../types/response-types";
import { handleActionError, sanitizeInput } from "../../lib/utils/utils";

export const signInCredential = async (
  credentials: z.infer<typeof signInSchema>
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const sanitizedCredentials = {
      ...credentials,
      identifier: sanitizeInput(credentials.identifier).toLowerCase(),
    };

    const parsedData = signInSchema.safeParse(sanitizedCredentials);
    if (!parsedData.success) {
      return createAuthResponse(false, parsedData.error.errors[0].message);
    }

    await signIn("credentials", {
      ...parsedData.data,
      redirect: false,
    });

    return createAuthResponse(true, "Login successful");
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return createAuthResponse(false, "Invalid credentials");
        case "AccessDenied":
          return createAuthResponse(
            false,
            "Access denied. Please verify your email first."
          );
        default:
          return createAuthResponse(false, "An authentication error occurred");
      }
    }
    const errorMessage = handleActionError(error, "Sign in failed");
    return createAuthResponse(false, errorMessage);
  }
};
