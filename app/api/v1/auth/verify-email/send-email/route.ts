import EmailVerification from "@/components/auth/EmailTemplet";
import { encryptToken } from "@/utils/crypto.utils";
import { generateVerificationToken } from "@/utils/token.utils";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email: to } = await req.json();
    console.log("Sending verification email to:", to);

    const token = await generateVerificationToken(to);
    console.log("Generated token:", token);
    const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "default@example.com";
    const expirationHours = process.env.EMAIL_TOKEN_EXPIRATION_TIME || "1";
    const encryptedToken = await encryptToken(token!);
    const appName = process.env.APP_NAME || "Your App Name";

    const verificationLink = `${baseurl}/auth/verify/${encodeURIComponent(
      to
    )}/${encodeURIComponent(encryptedToken)}`;

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Verify Your Email - ${appName}`,
      react: EmailVerification({ verificationLink, expirationHours }),
    });

    console.log(error);
    if (error) {
      return NextResponse.json(
        { message: error.message, success: false },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Check Your Email", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to Send Email",
        success: false,
      },
      { status: 500 }
    );
  }
}
