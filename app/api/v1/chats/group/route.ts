import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = await proxyToChatAPI(
      req,
      "/api/v1/chats/group",
      "POST",
      session.accessToken,
      undefined,
      body
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.log("Error creating group chat:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
