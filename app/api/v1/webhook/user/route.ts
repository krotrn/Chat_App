import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { userId, action, data } = await req.json();

  try {
    await axios.post(
      `${process.env.CHAT_API_URL}/api/v1/webhook/user`,
      { userId, action, data },
      {
        headers: {
          "x-internal-api-key": process.env.INTERNAL_API_KEY,
        },
      }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}