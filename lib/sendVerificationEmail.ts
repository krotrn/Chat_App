import { Resend } from "resend";
import { encryptToken } from "@/utils/crypto.utils";
import EmailVerification from "@/components/auth/EmailTemplet";
import { generateVerificationToken } from "@/utils/token.utils";


/**
 * Sends a verification email to the specified email address.
 *
 * @param {string} to - The email address to send the verification email to.
 * @returns {Promise<{ error?: string }>} - A promise that resolves to an object containing an error message if the email sending fails.
 *
 * @throws Will throw an error if the email sending process fails.
 *
 * @example
 * const result = await sendVerificationEmail('example@example.com');
 * if (result.error) {
 *   console.error('Failed to send verification email:', result.error);
 * } else {
 *   console.log('Verification email sent successfully');
 * }
 */

export const sendVerificationEmail = async (to: string) => {
  try {
    const token = await generateVerificationToken(to);
    const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const apiKey = process.env.RESEND_API_KEY!;
    const from = process.env.RESEND_FROM_EMAIL!;
    const expirationHours = process.env.EMAIL_TOKEN_EXPIRATION_TIME || "1";
    const resend = new Resend(apiKey);
    const encryptedToken = encryptToken(token!);
    const appName = process.env.APP_NAME || "Your App Name";

    const verificationLink = `${baseurl}/auth/verify?${new URLSearchParams(
      {
        email: encodeURIComponent(to),
        token: encodeURIComponent(encryptedToken),
      }
    )}`;

    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Verify Your Email - ${appName}`,
      react: EmailVerification({ verificationLink, expirationHours }),
    });

    return { error: error?.message };

  } catch(error) {
    console.log(error)
    return { error: "Failed to send verification email" };
  }
};
