import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await axios.get(`${process.env.CHAT_API_URL}/api/v1/chats`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
