import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/auth/user.models";
import { registerSchema } from "@/schemas/registerSchema";
import { UserType } from "@/types/User.type";
import { UserRolesEnum } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, role } = await req.json();
    const parsedData = registerSchema.safeParse({ email, password, username });
    if (!parsedData.success) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 401,
          message: parsedData.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    await connectToDatabase()

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 401,
          message: "Email or username already Exist.",
        })
      );
    }

    const user: UserType = await User.create({
      email,
      username,
      password,
      role: role || UserRolesEnum.USER,
    });
    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id)
      .select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      )
      .lean();
    if (!createdUser) {
      throw new ApiError({
        statusCode: 500,
        message: "Something went wrong while registering the user",
      });
    }

    return NextResponse.json(
      new ApiResponse({
        statusCode: 201,
        data: createdUser,
        message:
          "Users registered successfully and verification email has been sent on your email",
      })
    );
  } catch (error) {
    throw new ApiError({ statusCode: 500, message: (error as Error).message });
  }
}
