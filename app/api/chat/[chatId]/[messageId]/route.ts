import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ChatMessage } from "@/models/chat-app/message.models";
import { emitSocketEvent } from "@/socket";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { removeLocalFile } from "@/utils/Helper";
import { ChatEventEnum } from "@/utils/constants";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose, { isValidObjectId } from "mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
    // connect to DB
    await connectToDatabase();
    const { chatId, messageId } = params;
    const user = req.headers.get("user");

    if (!isValidObjectId(chatId)|| !isValidObjectId(messageId)) {
      return NextResponse.json(new ApiResponse({statusCode:500, message:"Not VaildId"}))
    }
    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const chat = await Chat.findById(chatId);

    // if chat there is no chat or user is not the participant
    if (
      !chat ||
      !chat.participants.includes(new mongoose.Types.ObjectId(user))
    ) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Chat not found" })
      );
    }

    // find the message
    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "Message does not exist" })
      );
    }

    // if sender is not same
    if (message.sender.toString() !== user.toString()) {
      return NextResponse.json(
        new ApiError({
          statusCode: 403,
          message: "You are not authorized to delete this message",
        })
      );
    }

    // remove the attachments if any
    if (message.attachments.length > 0) {
      message.attachments.forEach((asset) => removeLocalFile(asset.localPath));
    }

    // delete the chat
    await ChatMessage.deleteOne({ _id: message._id });

    // change the last message if it is a last message
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

    await Promise.all(
      chat.participants.map((participantObjectId) =>
        participantObjectId.toString() !== user.toString()
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
