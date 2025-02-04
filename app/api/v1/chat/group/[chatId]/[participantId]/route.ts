import { connectToDatabase } from "@/lib/mongoose";
import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/api/ApiError";
import { ApiResponse } from "@/utils/api/ApiResponse";
import { ChatEventEnum } from "@/utils/chat/constants";
import mongoose, { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handle Add Participant
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string; participantId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId, participantId } = params;
    const user = req.headers.get("user");

    if (!isValidObjectId(chatId) || !isValidObjectId(participantId)) {
      return NextResponse.json(
        new ApiResponse({ statusCode: 500, message: "Not VaildId" })
      );
    }

    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    // getting the chatId
    const groupChat: ChatType | null = await Chat.findById(chatId).select(
      "admin participants isGroupChat"
    );

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist.",
      });
    }

    if (groupChat.admin?.toString() !== user.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    if (
      groupChat.participants.some(
        (p) => p.toString() === participantId.toString()
      )
    ) {
      throw new ApiError({
        statusCode: 400,
        message: "Participant already exists in the group",
      });
    }

    // add Participant
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $addToSet: { participants: new mongoose.Types.ObjectId(participantId) },
      },
      { new: true }
    ).populate("participants admin lastMessage");

    if (!updatedChat) {
      throw new ApiError({
        statusCode: 500,
        message: "Error adding participant to the group",
      });
    }

    await emitSocketEvent(
      req,
      participantId,
      ChatEventEnum.NEW_CHAT_EVENT,
      updatedChat
    );

    return NextResponse.json(
      new ApiResponse({ statusCode: 200, data: updatedChat, success: true })
    );
  } catch (error) {
    console.error("Error in POST /chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: error instanceof ApiError ? error.statusCode : 500,
        message:
          error instanceof ApiError ? error.message : "Internal Server Error",
      })
    );
  }
}

/**
 * Kicking from Group
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; participantId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId, participantId } = params;
    const user = req.headers.get("user");

    if (!isValidObjectId(chatId) || !isValidObjectId(participantId)) {
      return NextResponse.json(
        new ApiResponse({ statusCode: 500, message: "Not VaildId" })
      );
    }

    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const groupChat: ChatType | null = await Chat.findById(chatId).select(
      "admin participants isGroupChat"
    );

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist.",
      });
    }

    if (groupChat.admin?.toString() !== user.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    if (!groupChat.participants.some((p) => p.toString() === participantId)) {
      throw new ApiError({
        statusCode: 400,
        message: "Participant does not exist in the group",
      });
    }

    // Join Group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: new mongoose.Types.ObjectId(participantId) } },
      { new: true }
    ).populate("participants admin lastMessage");

    if (!updatedChat) {
      throw new ApiError({
        statusCode: 500,
        message: "Error removing participant from the group",
      });
    }

    await emitSocketEvent(
      req,
      participantId,
      ChatEventEnum.LEAVE_CHAT_EVENT,
      updatedChat
    );

    return NextResponse.json(
      new ApiResponse({ statusCode: 200, data: updatedChat, success: true })
    );
  } catch (error) {
    console.error("Error in DELETE /chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: error instanceof ApiError ? error.statusCode : 500,
        message:
          error instanceof ApiError ? error.message : "Internal Server Error",
      })
    );
  }
}
