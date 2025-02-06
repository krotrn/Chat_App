import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { ChatMessage } from "@/models/chat-app/message.models";
import { Chat } from "@/models/chat-app/chat.models";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { removeLocalFile } from "@/lib/chat/Helper";
import { chatMessageCommonAggregation } from "@/lib/chat/chatHelper";
import { emitSocketEvent } from "@/socket";
import { ChatEventEnum } from "@/lib/chat/constants";
import { connectToDatabase } from "@/lib/mongoose";
import { MessageAttachmentType, MessageType } from "@/types/Message.type";
import { ChatType } from "@/types/Chat.type";
import {
  chatIdSchema,
  messageSchema,
  userSchema,
} from "@/schemas/paramsSchema";
import { auth } from "@/auth";

/**
 * Handles DELETE request to delete all messages in a chat
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectToDatabase();
    const parsedParams = chatIdSchema.safeParse(params);

    if (!parsedParams.success) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 400,
          message: parsedParams.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    const { chatId } = parsedParams.data;

    // Getting all messages related to chat.
    const messages: MessageType[] = await ChatMessage.find({
      chat: new mongoose.Types.ObjectId(chatId),
    });

    // Getting all attachment related to chat.
    const attachments: MessageAttachmentType[] = messages.flatMap(
      (message) => message.attachments
    );

    // Remove files
    attachments.forEach((attachment) => {
      removeLocalFile(attachment.localPath);
    });

    // Delete all messages
    await ChatMessage.deleteMany({ chat: new mongoose.Types.ObjectId(chatId) });

    return NextResponse.json(
      new ApiResponse({ statusCode: 200, message: "Messages deleted" })
    );
  } catch (error) {
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as Error).message,
      })
    );
  }
}

/**
 * Handles GET request to fetch all messages in a chat
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectToDatabase();
    const parsedParams = chatIdSchema.safeParse(params);
    if (!parsedParams.success) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 400,
          message: parsedParams.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    const { chatId } = parsedParams.data;
    const session = await auth();

    if (!session || !session.user?._id) {
      return new ApiError({
        statusCode: 401,
        message: "Unauthorized: Missing or invalid session",
      });
    }
    const userHeader = session.user._id;

    const parsedUser = userSchema.safeParse(userHeader);

    if (!parsedUser.success) {
      return NextResponse.json(
        new ApiError({
          statusCode: 401,
          message:
            "Unauthorized: " +
            parsedUser.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    const user = parsedUser.data.user;

    const selectedChat: ChatType | null = await Chat.findById(chatId);
    if (!selectedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    if (
      !selectedChat.participants.includes(
        new mongoose.Types.ObjectId(user.toString())
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
        message: "Messages fetched",
        success: true,
      })
    );
  } catch (error: unknown) {
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as Error).message,
      })
    );
  }
}

/**
 * Handle Send Message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectToDatabase();
    const parsedParams = chatIdSchema.safeParse(params);
    if (!parsedParams.success) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 400,
          message: parsedParams.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    const parsedBody = messageSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 400,
          message: parsedBody.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    const { chatId } = parsedParams.data;
    const { content, files } = parsedBody.data;
    const session = await auth();

    if (!session || !session.user?._id) {
      return new ApiError({
        statusCode: 401,
        message: "Unauthorized: Missing or invalid session",
      });
    }
    const userHeader = session.user._id;
    const parsedUser = userSchema.safeParse(userHeader);

    if (!parsedUser.success) {
      return NextResponse.json(
        new ApiError({
          statusCode: 401,
          message:
            "Unauthorized" +
            parsedUser.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    const user = parsedUser.data.user;

    const selectedChat = await Chat.findById(chatId);
    if (!selectedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    if (
      !selectedChat.participants.includes(new mongoose.Types.ObjectId(user))
    ) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const messageFiles: MessageAttachmentType[] =
      files?.attachments?.map((file) => ({
        url: `/uploads/${file.filename}`,
        localPath: `/uploads/${file.filename}`,
      })) || [];

    const message: MessageType = await ChatMessage.create({
      sender: new mongoose.Types.ObjectId(user),
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

    await Promise.all(
      selectedChat.participants.map(async (participantObjectId) =>
        participantObjectId.toString() !== user.toString()
          ? await emitSocketEvent(
              req,
              participantObjectId.toString(),
              ChatEventEnum.MESSAGE_RECEIVED_EVENT,
              receivedMessage
            )
          : null
      )
    );

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: receivedMessage,
        message: "Message Sent",
        success: true,
      })
    );
  } catch (error: unknown) {
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as Error).message,
      })
    );
  }
}
