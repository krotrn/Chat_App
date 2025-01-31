import { ChatMessage } from "@/models/chat-app/message.models";
import { MessageAttachmentType, MessageType } from "@/types/Message.type";
import { ApiError } from "@/utils/ApiError";
import { removeLocalFile } from "@/utils/Helper";
import { chatMessageCommonAggregation } from "@/utils/chatHelper";
import { ChatType } from "@/types/Chat.type";
import mongoose, { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ApiResponse } from "@/utils/ApiResponse";
import { emitSocketEvent } from "@/socket";
import { ChatEventEnum } from "@/utils/constants";
import { connectToDatabase } from "@/lib/mongoose";

/**
 * Handles DELETE request to delete all messages in a chat
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    // Connecting to DB.
    await connectToDatabase();
    const { chatId } = params;

    if (!isValidObjectId(chatId)) {
      return NextResponse.json(new ApiResponse({statusCode:500, message:"Not VaildId"}))
    }
    // Getting all messages related to chat.
    const messages: MessageType[] = await ChatMessage.find({
      chat: new mongoose.Types.ObjectId(chatId),
    });

    // Getting all attachment related to chat.
    const attachments: MessageAttachmentType[] = [
      ...messages.map((message) => message.attachments),
    ].flat();

    // Remove from the local file
    attachments.forEach((attachment) => {
      removeLocalFile(attachment.localPath);
    });

    // delete all messages
    await ChatMessage.deleteMany({ chat: new mongoose.Types.ObjectId(chatId) });
  } catch (error) {
    throw new ApiError({
      statusCode: 500,
      message: (error as NodeJS.ErrnoException).message,
    });
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
    const { chatId } = params;

    // get userId
    const user = req.headers.get("user");

    // if user not found
    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    // Get chat.
    const selectedChat: ChatType | null = await Chat.findById(chatId);
    if (!selectedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    // if user is not participants of that chat
    if (
      !selectedChat.participants.includes(
        new mongoose.Types.ObjectId(user.toString())
      )
    ) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    // get all messages
    const messages: MessageType[] = await ChatMessage.aggregate([
      { $match: { chat: new mongoose.Types.ObjectId(chatId) } },
      ...chatMessageCommonAggregation(),
      { $sort: { createdAt: -1 } },
    ]);

    // send the messages
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

/**
 * Handle Send Message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    const { content, files } = await req.json();


    // get userid
    const user = req.headers.get("user");

    if (!isValidObjectId(chatId)) {
      return NextResponse.json(new ApiResponse({statusCode:500, message:"Not VaildId"}))
    }

    // if user not exist
    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    // select chat
    const selectedChat = await Chat.findById(chatId);
    if (!selectedChat) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    // if user is not participants of that chat
    if (
      !selectedChat.participants.includes(
        new mongoose.Types.ObjectId(user)
      )
    ) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const messageFiles: MessageAttachmentType[] = [];

    // if there is a file then attach that to
    if (files?.attachments?.length > 0) {
      files.attachments.forEach((file: { filename: string }) => {
        messageFiles.push({
          url: `/uploads/${file.filename}`,
          localPath: `/uploads/${file.filename}`,
        });
      });
    }

    // create message
    const message: MessageType = await ChatMessage.create({
      sender: new mongoose.Types.ObjectId(user),
      content: content || "",
      chat: new mongoose.Types.ObjectId(chatId),
      attachments: messageFiles,
    });

    // update the chat with last message
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
    console.error("POST Error:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
