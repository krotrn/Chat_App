import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ChatMessage } from "@/models/chat-app/message.models";
import { emitSocketEvent } from "@/socket";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { removeLocalFile } from "@/utils/Helper";
import { ChatEventEnum } from "@/utils/constants";
import { connectToDatabase } from "@/lib/mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId, messageId } = params;
    const { user } = await req.json();
    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(user._id)) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Message does not exist" })
      );
    }

    if (message.sender.toString() !== user._id.toString()) {
      return NextResponse.json(
        new ApiError({
          statusCode: 403,
          message: "You are not authorized to delete this message",
        })
      );
    }

    if (message.attachments.length > 0) {
      message.attachments.forEach((asset) => removeLocalFile(asset.localPath));
    }

    await ChatMessage.deleteOne({ _id: message._id });

    if (chat.lastMessage?.toString() === message._id.toString()) {
      const lastMessage = await ChatMessage.findOne(
        { chat: chatId },
        {},
        { sort: { createdAt: -1 } }
      );
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: lastMessage?._id || null,
      });
    }

    chat.participants.forEach((participantObjectId) => {
      if (participantObjectId.toString() !== user._id.toString()) {
        emitSocketEvent(
          req,
          participantObjectId.toString(),
          ChatEventEnum.MESSAGE_DELETE_EVENT,
          message
        );
      }
    });

    return NextResponse.json(
      new ApiResponse({ statusCode: 200, data: message })
    );
  } catch (error: unknown) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
