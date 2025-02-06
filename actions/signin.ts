"use server";

import { signIn } from "@/auth";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { signInSchema } from "@/schemas/signinSchema";
import { AuthError } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const signin = async (credentials: z.infer<typeof signInSchema>) => {
  const parsedData = signInSchema.safeParse(credentials);

  if (!parsedData.success) {
    return NextResponse.json(
      new ApiResponse({ statusCode: 402, message: "Invalid Field" })
    );
  }

  const { email, password, username } = parsedData.data;

  try {
    await signIn("credentials", { email, username, password });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return NextResponse.json(
            new ApiError({ statusCode: 402, message: "Invalid Credentials." })
          );
        default:
          return NextResponse.json(
            new ApiError({ statusCode: 500, message: "something went wro.ng" })
          );
      }
    }
    throw new ApiError({ statusCode: 500, message: (error as Error).message });
  }
};
