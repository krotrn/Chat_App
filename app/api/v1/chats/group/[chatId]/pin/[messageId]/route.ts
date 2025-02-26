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
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/chat/${params.chatId}/pin/${params.messageId}`,
      "POST",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error pinning message:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/chat/${params.chatId}/pin/${params.messageId}`,
      "DELETE",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error unpinning message:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
