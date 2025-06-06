"use server";
import { signIn } from "@/auth";
import { signInSchema } from "@/schemas/signinSchema";
import { AuthError } from "next-auth";
import { z } from "zod";
export const signInCredential = async (
  credentials: z.infer<typeof signInSchema>,
) => {
  const parsedData = signInSchema.safeParse(credentials);
  if (!parsedData.success) {
    return { success: false, message: "Invalid credentials format" };
  }

  try {
    await signIn("credentials", {
      ...parsedData.data,
      redirect: false,
    });

    return { success: true, message: "Login successful" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid credentials" };
        default:
          return {
            success: false,
            message: "An authentication error occurred",
          };
      }
    }
    throw error;
  }
};
