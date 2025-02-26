import axios from "axios";
import { NextRequest } from "next/server";

export async function proxyToChatAPI(
  req: NextRequest,
  endpoint: string,
  methord: string,
  accessToken: string,
  params?: Record<string, string>,
  body?: unknown
) {
  const url = `${process.env.CHAT_API_URL}${endpoint}`;
  const config = {
    methord,
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    params,
    data: body,
    responseType: "json",
    timeout: 10000,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error("Internal server error while proxying to Chat API");
  }
}
