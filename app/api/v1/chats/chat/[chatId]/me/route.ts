import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/chats/chat/${params.chatId}/me`,
      "DELETE",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log("Error deleting chat for me:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
