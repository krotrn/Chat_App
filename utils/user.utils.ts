import { ApiError } from "@/lib/api/ApiError";
import { db } from "@/prisma";
import { User } from "@prisma/client";

export interface Options {
  emailVerificationToken?: boolean;
  emailVerificationExpiry?: boolean;
  emailVerified?: boolean;
  loginType?: boolean;
}

/**
 * Retrieves a user by their email address.
 *
 * @param email - The email address of the user to retrieve.
 * @param options - Additional options for selecting user fields.
 * @returns A promise that resolves to a partial user object or null if not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves a user by their email or username.
 *
 * @param identifier - The email or username of the user to retrieve.
 * @param options - Additional options for selecting specific fields.
 * @returns A promise that resolves to a partial user object or null if no user is found.
 * @throws {ApiError} If there is an error retrieving the user.
 */
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


/**
 * Retrieves a user by their unique identifier.
 *
 * @param id - The unique identifier of the user.
 * @param options - Additional options for selecting specific fields of the user.
 * @returns A promise that resolves to a partial user object or null if the user is not found.
 * @throws {ApiError} If there is an error retrieving the user.
 */
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
