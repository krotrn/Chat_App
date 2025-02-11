"use server";
import { verifyToken } from "@/utils/token.utils";

export const verify = async (email: string, userToken: string) => {
  const verificationResult = await verifyToken(email, userToken);
  
  if (verificationResult?.error) {
    return { error: verificationResult.error };
  }
  
  if (verificationResult?.success) {
    return { success: verificationResult.success };
  }
  
  return { error: "Unknown verification error" };
};