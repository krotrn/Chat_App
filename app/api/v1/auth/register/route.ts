import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
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
      new ApiError({ statusCode: 400, message: "Name is required" }).toJSON()
    );
  }

  if (!email) {
    NextResponse.json(
      new ApiError({ statusCode: 400, message: "Email is required" }).toJSON()
    );
  }
  if (!password) {
    NextResponse.json(
      new ApiError({ statusCode: 400, message: "Password is required" }).toJSON()
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
        new ApiResponse({ statusCode: 402, message: "Email already in use" }).toJSON()
      );
    }
    if (existingUsername?.emailVerified) {
      return NextResponse.json(
        new ApiResponse({ statusCode: 402, message: "Username already in use" }).toJSON()
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
          new ApiError({
            statusCode: 409,
            message: "Registration conflict detected",
          }).toJSON()
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
      return NextResponse.json(new ApiError({ statusCode: 500, message: "error creating user" }).toJSON());
    }
    

    const { error } = await sendVerificationEmail(email);

    // statuscode
    if (error) {
      return NextResponse.json(
        new ApiError({ statusCode: 500, message: error }).toJSON()
      );
    }

    return NextResponse.json(
      new ApiResponse({ statusCode: 201, message: "Verify your Account." }).toJSON()
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      // statuscode
      if (error.code === "P2002") {
        return NextResponse.json(
          new ApiError({
            statusCode: 500,
            message: "Duplicate registration attempt detected",
          }).toJSON()
        );
      }
    }

    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to complete registration",
      }).toJSON()
    );
  }
}
