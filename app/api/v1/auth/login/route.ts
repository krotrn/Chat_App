import { signIn } from "@/auth";
import { db } from "@/prisma";
import { signInSchema } from "@/schemas/signinSchema";
import { AccountType } from "@prisma/client";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.json();
  const parsedData = signInSchema.safeParse(formData);
  if (!parsedData.success) {
    return NextResponse.json({ success: false, message: "Invalid fields" });
  }

  const { identifier, password } = parsedData.data;

  const existingUser = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    select: { loginType: true, emailVerified: true, email: true },
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
      {
        success: false,
        message: "User not Verified",
        sendEmail: true,
        encodedEmail: encodeURIComponent(existingUser.email),
      },
      { status: 404 }
    );
  }

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    return NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    if (error instanceof AuthError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
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
