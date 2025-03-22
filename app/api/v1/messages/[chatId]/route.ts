import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { proxyToChatAPI } from "@/lib/utils/proxy";
import { IncomingForm } from "formidable";
import { createReadStream } from "fs";
import { FormData as NodeFormData } from "formdata-node";
import axios from "axios";
import { IncomingMessage } from "http";
import { FileAttachment } from "@/types/FilesAttachment.type";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await proxyToChatAPI(
      req,
      `/api/v1/messages/${(await context.params).chatId}`,
      "GET",
      session.accessToken
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = new IncomingForm({ multiples: true });
    const [fields, files] = await new Promise<
      [
        Record<string, string | string[] | undefined>,
        Record<string, FileAttachment | FileAttachment[]>
      ]
    >((resolve, reject) => {
      form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
        if (err) reject(err);
        resolve([
          fields,
          files as Record<string, FileAttachment | FileAttachment[]>,
        ]);
      });
    });

    const formData = new NodeFormData();
    if (fields.content) formData.append("content", fields.content);
    const fileArray = Array.isArray(files.attachments)
      ? files.attachments
      : files.attachments
      ? [files.attachments]
      : [];
    fileArray.forEach((file: FileAttachment) => {
      const stream = createReadStream(file.filepath);
      formData.append("attachments", stream, file.originalFilename);
    });

    const url = `${process.env.CHAT_API_URL}/api/v1/messages/${(await context.params).chatId}`;
    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      timeout: 10000,
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
