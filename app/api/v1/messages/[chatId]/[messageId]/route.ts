import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";

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
      `/api/v1/messages/${params.chatId}/${params.messageId}`,
      "DELETE",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
