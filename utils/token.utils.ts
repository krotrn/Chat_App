import { ApiError } from "@/lib/api/ApiError";

/**
 * Generates a verification token for the given email by making a POST request to the verification API.
 *
 * @param {string} email - The email address for which to generate the verification token.
 * @returns {Promise<string>} - A promise that resolves to the verification token.
 * @throws {ApiError} - Throws an ApiError if the request fails or if there is an error creating the verification token.
 */
export const generateVerificationToken = async (email: string): Promise<string> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/v1/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });


    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new ApiError({
        statusCode: response.status,
        message: data.message || "Failed to generate verification token",
      });
    }

    if (!data.token) {
      throw new ApiError({
        statusCode: 500,
        message: "Token missing in response",
      });
    }

    return data.token;

  } catch (error) {
    console.log(error);
    throw new ApiError({
      statusCode: 500,
      message: "Error creating Verification token",
    });
  }
};
