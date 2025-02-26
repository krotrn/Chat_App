import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/group/${params.chatId}`,
      "GET",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log("Error fetching group chat:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/group/${params.chatId}`,
      "PATCH",
      session.accessToken,
      undefined,
      body
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log("Error renaming group chat:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/group/${params.chatId}`,
      "DELETE",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting group chat:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
