import { auth } from "@/auth";

export const handleActionError = (
  error: unknown,
  defaultMessage: string = "An unexpected error occurred",
): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  console.error("Unhandled error type:", error);
  return defaultMessage;
};

export const requireAuth = async () => {
  const session = await auth();

  if (!session || !session.user?.id) {
    throw new Error("User not authenticated");
  }

  return session;
};

export const validateEnvironmentVariables = (
  envVars: Record<string, string | undefined>,
): void => {
  const missingVars = Object.entries(envVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
};

export const validateRequiredParams = (
  params: Record<string, unknown>,
): void => {
  const missingParams = Object.entries(params)
    .filter(
      ([, value]) => value === undefined || value === null || value === "",
    )
    .map(([key]) => key);

  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(", ")}`);
  }
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  return input.trim();
};
