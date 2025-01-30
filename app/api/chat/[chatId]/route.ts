import { ChatMessage } from "@/models/chat-app/message.models";
import { MessageAttachmentType, MessageType } from "@/types/Message.type";
import { ApiError } from "@/utils/ApiError";
import { removeLocalFile } from "@/utils/Helper";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const messages: MessageType[] = await ChatMessage.find({
    chat: new mongoose.Types.ObjectId(chatId),
  });

  if (!messages) {
    throw new ApiError({
      statusCode: 404,
      message: "Messages not found",
    });
  }

  let attachments: MessageAttachmentType[] = [];

  attachments = attachments.concat(
    ...messages.map((message) => message.attachments)
  );

  attachments.forEach((attachment) => {
    removeLocalFile(attachment.localPath);
  });

  await ChatMessage.deleteMany({ chat: new mongoose.Types.ObjectId(chatId) });
}
