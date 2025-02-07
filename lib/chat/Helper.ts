import fs from "fs/promises";
import { AuthError } from "next-auth";

export const removeLocalFile = async (localPath: string): Promise<void> => {
  try {
    await fs.unlink(localPath);
    console.info(`✅ Successfully removed file: ${localPath}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`⚠️ File not found, skipping deletion: ${localPath}`);
    } else {
      console.error(`❌ Error while removing file (${localPath}):`, error);
    }
  }
};


export const handleAuthError = (error: AuthError): { error: string } => {
  switch (error.type) {
    case "CredentialsSignin":
      return { error: "Invalid credentials." };
    case "CallbackRouteError":
      return { error: "Account does not exist." };
    case "OAuthSignInError":
      return { error: "OAuth authentication failed." };
    case "OAuthCallbackError":
      return { error: "OAuth callback error." };
    case "OAuthAccountNotLinked":
      return { error: "Failed to create OAuth account." };
    case "EmailSignInError":
      return { error: "Failed to create an email-based account." };
    case "AccountNotLinked":
      return { error: "This email is already linked to another account." };
    case "SessionTokenError":
      return { error: "Please log in to continue." };
    default:
      return { error: "Something went wrong. Please try again." };
  }
};

