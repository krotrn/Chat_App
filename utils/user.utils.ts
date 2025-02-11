import { ApiError } from "@/lib/api/ApiError";
import { db } from "@/prisma";
import { User } from "@prisma/client";

export interface Options {
  emailVerificationToken?: boolean;
  emailVerificationExpiry?: boolean;
  emailVerified?: boolean;
  loginType?: boolean;
}

export const getUserByEmail = async (
  email: string,
  options: Options = {}
): Promise<Partial<User> | null> => {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, ...options },
    });
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        message: "User not found",
      });
    }
    return user;
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: "error getting user by email",
    });
  }
};
export const getUserByIdentifier = async (
  identifier: string,
  options: Options = {}
): Promise<Partial<User> | null> => {
  try {
    const user = await db.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
      select: { id: true, email: true, username: true, ...options },
    });
    return user;
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: "error getting user by email",
    });
  }
};


export const getUserById = async (
  id: string,
  options: Options = {}
): Promise<Partial<User> | null> => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, ...options },
    });
    return user;
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: "Error getting user by ID",
    });
  }
};
