import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ChatMessage } from "@/models/chat-app/message.models";
import mongoose from "mongoose";
import { chatMessageCommonAggregation } from "@/utils/chatHelper";
import { ChatType } from "@/types/Chat.type";
import { MessageAttachmentType, MessageType } from "@/types/Message.type";
import { emitSocketEvent } from "@/socket";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { removeLocalFile } from "@/utils/Helper";
import { ChatEventEnum } from "@/utils/constants";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
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
