import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ChatMessage } from "@/models/chat-app/message.models";
import { emitSocketEvent } from "@/socket";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { removeLocalFile } from "@/lib/chat/Helper";
import { ChatEventEnum } from "@/lib/chat/constants";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";
import { userSchema } from "@/schemas/paramsSchema";
import { messageParamsSchema } from "@/schemas/paramsSchema";
import { auth } from "@/auth";

/**
 * Handles DELETE request to delete a single message in a chat
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
    await connectToDatabase();

    //  Validate request params
    const parsedParams = messageParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      return NextResponse.json(
        new ApiError({
          statusCode: 400,
          message: parsedParams.error.errors.map((e) => e.message).join(", "),
        })
      );
    }

    //  Validate user header
    const session = await auth();

    if (!session || !session.user?._id) {
      return new ApiError({ statusCode: 401, message: "Unauthorized: Missing or invalid session" });
    }
    const userHeader = session.user._id;
    const parsedUser = userSchema.safeParse({ user: userHeader });
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

    const { chatId, messageId } = parsedParams.data;
    const userId = parsedUser.data.user;

    //  Check if chat exists
    const chat = await Chat.findById(chatId);
    if (
      !chat ||
      !chat.participants.includes(new mongoose.Types.ObjectId(userId))
    ) {
      return NextResponse.json(
        new ApiError({
          statusCode: 404,
          message: "Chat not found or unauthorized",
        })
      );
    }

    //  Check if message exists
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Message does not exist" })
      );
    }

    //  Check if the user is the sender
    if (message.sender.toString() !== userId.toString()) {
      return NextResponse.json(
        new ApiError({
          statusCode: 403,
          message: "You are not authorized to delete this message",
        })
      );
    }

    //  Remove the attachments if any
    message.attachments.forEach((asset) => removeLocalFile(asset.localPath));

    //  Delete the message
    await ChatMessage.deleteOne({ _id: message._id });

    //  Update last message if deleted message was the last one
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

    //  Notify participants about the deleted message via WebSocket
    await Promise.all(
      chat.participants.map((participantObjectId) =>
        participantObjectId.toString() !== userId.toString()
          ? emitSocketEvent(
              req,
              participantObjectId.toString(),
              ChatEventEnum.MESSAGE_DELETE_EVENT,
              message
            )
          : null
      )
    );

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: message,
        message: "Message deleted successfully",
      })
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
