// utils/email.utils.ts
import { Resend } from "resend";
import { encryptToken } from "@/utils/crypto.utils";
import { generateOTP } from "@/utils/auth.utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const encryptedToken = encryptToken(token);
    const otp = generateOTP(6);
    const expirationHours = 1;
    const appName = process.env.APP_NAME || "Your App Name";

    const verificationLink = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email?${new URLSearchParams({
      email: encodeURIComponent(email),
      otp: encodeURIComponent(otp),
      token: encodeURIComponent(encryptedToken)
    })}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verify Your Email Address</h2>
        
        <div style="margin: 20px 0;">
          <p>Option 1: Use the OTP code:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; 
              text-align: center; margin: 10px 0; font-size: 24px; 
              letter-spacing: 2px; font-weight: bold;">
            ${otp}
          </div>
        </div>

        <div style="margin: 20px 0;">
          <p>Option 2: Click the verification link:</p>
          <a href="${verificationLink}" 
             style="color: #2563eb; word-break: break-all;">
            ${verificationLink}
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          This verification will expire in ${expirationHours} hours.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Verify Your Email - ${appName}`,
      html: htmlContent,
    });

    return { success: !error, error: error?.message };

  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: "Failed to send verification email" };
  }
};