import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    await sendVerificationEmail(email);

    return NextResponse.json(
      { message: "Check Your Email", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to send email",
        success: false,
      },
      { status: 500 },
    );
  }
}
