import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { db } from "@/prisma";
import { hashPassword } from "@/utils/auth.utils";
import { UserRoles, AccountType } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the POST request for user registration.
 *
 * This function processes the registration form data, checks for existing email and username,
 * deletes unverified users with the same email or username, creates a new user, and sends a verification email.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The response object containing the status and message.
 *
 * @throws {PrismaClientKnownRequestError} If a known Prisma client error occurs.
 * @throws {Error} If an unknown error occurs during registration.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.json();
  const { email, username, password } = formData;
  const expirationTimeInHours = Number(
    process.env.EMAIL_TOKEN_EXPIRATION_TIME!
  );

  if (!username) {
    return NextResponse.json(
      {
        success: false,
        message: "Username is required",
      },
      { status: 400 }
    );
  }

  if (!email) {
    NextResponse.json(
      {
        success: false,
        message: "Email is required",
      },
      { status: 400 }
    );
  }
  if (!password) {
    NextResponse.json(
      {
        success: false,
        message: "Password is required",
      },
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
        {
          success: false,
          message: "Email already in use",
        },
        {
          status: 402,
        }
      );
    }
    if (existingUsername?.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already in use",
        },
        {
          status: 402,
        }
      );
    }
    const newUser = await db.$transaction(async (tx) => {
      await Promise.all([
        tx.user.deleteMany({
          where: {
            OR: [
              { email, emailVerified: null },
              { username, emailVerified: null },
            ],
          },
        }),
      ]);
      const userAvailable = await tx.user.count({
        where: { OR: [{ email }, { username }] },
      });
      if (userAvailable > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Registration Conflict.",
          },
          { status: 409 }
        );
      }
      return await tx.user.create({
        data: {
          email,
          username,
          password: await hashPassword(password),
          role: UserRoles.USER,
          loginType: AccountType.EMAIL,
          emailVerified: null,
          emailVerificationExpiry: new Date(
            Date.now() + expirationTimeInHours * 3600 * 1000
          ),
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

    const { error } = await sendVerificationEmail(email);

    // statuscode
    if (error) {
      return NextResponse.json({ message: error }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verify your Account.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // statuscode
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate registration attempt detected",
          },
          {
            status: 500,
          }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete registration",
      },
      {
        status: 500,
      }
    );
  }
}
