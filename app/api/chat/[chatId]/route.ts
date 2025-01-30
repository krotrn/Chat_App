import { ChatMessage } from "@/models/chat-app/message.models";
import { MessageAttachmentType, MessageType } from "@/types/Message.type";
import { ApiError } from "@/utils/ApiError";
import { removeLocalFile } from "@/utils/Helper";
import { chatMessageCommonAggregation } from "@/utils/chatHelper";
import { ChatType } from "@/types/Chat.type";

import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ApiResponse } from "@/utils/ApiResponse";
import { emitSocketEvent } from "@/socket";
import { ChatEventEnum } from "@/utils/constants";
import { connectToDatabase } from "@/lib/mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  await connectToDatabase();
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

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    const user = req.headers.get("user");
    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const selectedChat: ChatType | null = await Chat.findById(chatId);
    if (!selectedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    if (
      !selectedChat.participants.includes(
        new mongoose.Schema.Types.ObjectId(user)
      )
    ) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const messages: MessageType[] = await ChatMessage.aggregate([
      { $match: { chat: new mongoose.Types.ObjectId(chatId) } },
      ...chatMessageCommonAggregation(),
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: messages,
        message: "Messages Fetched",
        success: true,
      })
    );
  } catch (error: unknown) {
    console.error("GET Error:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    const { content, files, user } = await req.json();
    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const selectedChat = await Chat.findById(chatId);
    if (!selectedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    const messageFiles: MessageAttachmentType[] = [];
    if (files?.attachments?.length > 0) {
      files.attachments.forEach((file: { filename: string }) => {
        messageFiles.push({
          url: `/uploads/${file.filename}`, // 🔥 Replace with actual file storage logic
          localPath: `/uploads/${file.filename}`,
        });
      });
    }

    const message = await ChatMessage.create({
      sender: new mongoose.Types.ObjectId(user._id),
      content: content || "",
      chat: new mongoose.Types.ObjectId(chatId),
      attachments: messageFiles,
    });

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: message._id },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Error updating chat" })
      );
    }

    const messages: MessageType[] = await ChatMessage.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(message._id.toString()) } },
      ...chatMessageCommonAggregation(),
    ]);

    const receivedMessage = messages[0];
    if (!receivedMessage) {
      return NextResponse.json(
        new ApiError({ statusCode: 500, message: "Internal server error" })
      );
    }

    selectedChat.participants.forEach((participantObjectId) => {
      if (participantObjectId.toString() !== user._id.toString()) {
        emitSocketEvent(
          req,
          participantObjectId.toString(),
          ChatEventEnum.MESSAGE_RECEIVED_EVENT,
          receivedMessage
        );
      }
    });

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: receivedMessage,
        message: "Message Sent",
        success: true,
      })
    );
  } catch (error: unknown) {
    console.error("POST Error:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
