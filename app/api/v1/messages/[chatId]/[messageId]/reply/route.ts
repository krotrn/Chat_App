import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ chatId: string; messageId: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {chatId, messageId} = await context.params
  try {
    const body = await req.json();
    const data = await proxyToChatAPI(
      req,
      `/api/v1/messages/${chatId}/${messageId}/reply`,
      "POST",
      session.accessToken,
      undefined,
      body
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error replying to message:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
