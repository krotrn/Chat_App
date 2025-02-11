"use server";
import { sendEmail } from "./sendEmail";

export const resendOTP = async (email: string) => {
  try {
    await sendEmail(email);
    return { success: "New OTP sent successfully" };
  } catch (error) {
    console.error("Resend error:", error);
    return { error: "Failed to resend OTP" };
  }
};