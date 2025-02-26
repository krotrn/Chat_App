import { config } from "@/config";
import { ApiError } from "@/lib/api/ApiError";


export const generateVerificationToken = async (email: string): Promise<string> => {
  try {
    const response = await fetch(`${config.baseUrl}/api/v1/auth/verify-email`, {
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
