import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ chatId: string; participantId: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {chatId, participantId} = await context.params

  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/group/${chatId}/participant/${participantId}`,
      "POST",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ chatId: string; participantId: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const {chatId, participantId} = await context.params


  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/group/${chatId}/participant/${participantId}`,
      "DELETE",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
