import fs from "fs/promises";
import { AuthError } from "next-auth";

/**
 * Asynchronously removes a local file at the specified path.
 *
 * @param localPath - The path to the local file to be removed.
 * @returns A promise that resolves when the file has been successfully removed.
 *
 * @throws Will log an error message if the file removal fails for reasons other than the file not existing.
 *
 * @example
 * ```typescript
 * await removeLocalFile('/path/to/file.txt');
 * ```
 */
export const removeLocalFile = async (localPath: string): Promise<void> => {
  try {
    await fs.unlink(localPath);
    console.info(`✅ Successfully removed file: ${localPath}`);
  } catch (error) {
    console.log(error)
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`⚠️ File not found, skipping deletion: ${localPath}`);
    } else {
      console.error(`❌ Error while removing file (${localPath}):`, error);
    }
  }
};


/**
 * Handles authentication errors and returns a standardized response.
 *
 * @param error - The authentication error object.
 * @returns An object containing a success flag and a message describing the error.
 *
 * @example
 * ```typescript
 * const error: AuthError = { type: "CredentialsSignin" };
 * const result = handleAuthError(error);
 * console.log(result); // { success: false, message: "Invalid credentials." }
 * ```
 *
 * Error types and their corresponding messages:
 * - "CredentialsSignin": "Invalid credentials."
 * - "CallbackRouteError": "Account does not exist."
 * - "OAuthSignInError": "OAuth authentication failed."
 * - "OAuthCallbackError": "OAuth callback error."
 * - "OAuthAccountNotLinked": "Failed to create OAuth account."
 * - "EmailSignInError": "Failed to create an email-based account."
 * - "AccountNotLinked": "This email is already linked to another account."
 * - "SessionTokenError": "Please log in to continue."
 * - Default: "Something went wrong. Please try again."
 */
export const handleAuthError = (error: AuthError): {success:boolean, message: string } => {
  switch (error.type) {
    case "CredentialsSignin":
      return { success:false, message: "Invalid credentials." };
    case "CallbackRouteError":
      return { success:false, message: "Account does not exist." };
    case "OAuthSignInError":
      return { success:false, message: "OAuth authentication failed." };
    case "OAuthCallbackError":
      return { success:false, message: "OAuth callback error." };
    case "OAuthAccountNotLinked":
      return { success:false, message: "Failed to create OAuth account." };
    case "EmailSignInError":
      return { success:false, message: "Failed to create an email-based account." };
    case "AccountNotLinked":
      return { success:false, message: "This email is already linked to another account." };
    case "SessionTokenError":
      return { success:false, message: "Please log in to continue." };
    default:
      return { success:false, message: "Something went wrong. Please try again." };
  }
};

