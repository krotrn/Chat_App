import { Resend } from "resend";
import { encryptToken } from "@/utils/crypto.utils";
import { generateOTP } from "@/utils/auth.utils";
import EmailVerification from "@/components/auth/EmailTemplet";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const encryptedToken = encryptToken(token);
    const otp = generateOTP(6);
    const expirationHours = 1;
    const appName = process.env.APP_NAME || "Your App Name";

    const verificationLink = `${baseurl}/auth/verify-email?${new URLSearchParams(
      {
        email: encodeURIComponent(email),
        otp: encodeURIComponent(otp),
        token: encodeURIComponent(encryptedToken),
      }
    )}`;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Verify Your Email - ${appName}`,
      react: EmailVerification({ otp, verificationLink, expirationHours }),
    });

    return { error: error?.message, success: !error ? "Email sent" : undefined };

  } catch (error) {
    console.error("Email sending error:", error);
    return { error: "Failed to send verification email" };
  }
};
