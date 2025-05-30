import { generateVerificationToken } from "@/lib/utils/token.utils";
import { encryptToken } from "@/lib/utils/crypto.utils";
import { config } from "@/config";
import EmailTemplate from "@/components/auth/EmailTemplate";
import { Resend } from "resend";

export const sendVerificationEmail = async (to: string): Promise<void> => {
  // Generate a verification token
  const token = await generateVerificationToken(to);
  const encryptedToken = await encryptToken(token);

  // Create verification link
  const verificationLink = `${config.baseUrl}/auth/verify/${encodeURIComponent(
    to,
  )}/${encodeURIComponent(encryptedToken)}`;

  // Initialize email provider (Resend)
  const resend = new Resend(config.resendApiKey);
  const { error } = await resend.emails.send({
    from: config.resendFromEmail,
    to,
    subject: `Verify Your Email - ${config.appName}`,
    react: EmailTemplate({
      verificationLink,
      expirationHours: String(config.emailTokenExpirationTime),
    }),
  });

  if (error) {
    throw new Error(error.message);
  }
};
