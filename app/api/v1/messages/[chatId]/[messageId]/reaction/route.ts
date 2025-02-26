import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await proxyToChatAPI(
      req,
      `/api/v1/messages/${params.chatId}/${params.messageId}/reaction`,
      "POST",
      session.accessToken,
      undefined,
      body
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
