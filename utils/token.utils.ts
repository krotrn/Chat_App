import { ApiError } from "@/lib/api/ApiError";
import { db } from "@/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a verification token for the given email and updates the user's record with the token and its expiry time.
 *
 * @param email - The email address of the user for whom the verification token is being generated.
 * @returns A promise that resolves to the generated verification token.
 * @throws {ApiError} If there is an error creating the verification token.
 */
export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expire = new Date(new Date().getTime() + 3600 * 100 * Number(process.env.EMAIL_TOKEN_EXPIRATION_TIME || 1));
  try {
    const user = await db.user.update({
      where: { email },
      data: { emailVerificationToken: token, emailVerificationExpiry: expire },
    });
    return user.emailVerificationToken;
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: "Error creating Verification token",
    });
  }
};