import { db } from "@/prisma";
import { registerSchema } from "@/schemas/registerSchema";
import { hashPassword } from "@/lib/utils/auth.utils";
import { UserRoles, AccountType } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.json();
  const parsedData = registerSchema.safeParse(formData);
  if (!parsedData.success) {
    return NextResponse.json({ success: false, message: "Invalid fields" });
  }
  const { email, username, password, confirmpassword } = parsedData.data;

  if (!username) {
    return NextResponse.json(
      { success: false, message: "Username is required" },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { success: false, message: "Password is required" },
      { status: 400 }
    );
  }

  if (password !== confirmpassword) {
    return NextResponse.json(
      { success: false, message: "Confirm Password does not match" },
      { status: 400 }
    );
  }

  try {
    const [existingEmail, existingUsername] = await Promise.all([
      db.user.findUnique({
        where: { email },
        select: { emailVerified: true },
      }),
      db.user.findUnique({
        where: { username },
        select: { emailVerified: true },
      }),
    ]);

    if (existingEmail?.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 402 }
      );
    }
    if (existingUsername?.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Username already in use" },
        { status: 402 }
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

      const userAvailable = await tx.user.count({
        where: { OR: [{ email }, { username }] },
      });
      if (userAvailable > 0) {
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
      return NextResponse.json(
        {
          success: false,
          message: "error creating user",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please verify your email.",
        sendEmail: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { success: false, message: "Duplicate registration attempt" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
}
