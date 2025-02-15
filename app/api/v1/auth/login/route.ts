import { signIn } from "@/auth";
import { handleAuthError } from "@/lib/chat/Helper";
import { db } from "@/prisma";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signInSchema } from "@/schemas/signinSchema";
import { AccountType } from "@prisma/client";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the POST request for user login.
 *
 * @param req - The incoming request object.
 * @returns A JSON response indicating the success or failure of the login attempt.
 *
 * The function performs the following steps:
 * 1. Parses the incoming request body as JSON.
 * 2. Validates the parsed data against the `signInSchema`.
 * 3. Checks if a user exists with the provided identifier (email or username).
 * 4. Verifies if the user has the correct login type and if their email is verified.
 * 5. Attempts to sign in the user using the provided credentials.
 * 6. Returns appropriate JSON responses based on the success or failure of each step.
 *
 * Possible responses:
 * - 200: Login successful.
 * - 402: User not verified.
 * - 404: Invalid credentials or incorrect login method.
 * - 500: An unexpected error occurred.
 */
export async function POST(req: NextRequest) {
  const formData = await req.json();
  const parsedData = signInSchema.safeParse(formData);
  if (!parsedData.success) {
    return NextResponse.json({ success: false, message: "Invalid fields" });
  }

  const { identifier, password } = parsedData.data;

  const existingUser = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    select: { loginType: true, emailVerified: true },
  });

  if (!existingUser) {
    return NextResponse.json(
      { success: false, message: "Invalid Credentials" },
      { status: 404 }
    );
  }

  if (existingUser.loginType !== AccountType.EMAIL) {
    return NextResponse.json(
      { success: false, error: "Login with the correct method." },
      { status: 404 }
    );
  }
  if (!existingUser.emailVerified) {
    return NextResponse.json(
      { success: false, message: "User not Verified", sendEmail: true },
      { status: 402 }
    );
  }

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });

    return NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(handleAuthError(error), { status: 500 });
    }

    if (typeof error === "object" && error !== null && "digest" in error) {
      const digest = (error as { digest?: string }).digest;
      if (digest?.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
