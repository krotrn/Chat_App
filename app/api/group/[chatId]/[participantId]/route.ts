import { connectToDatabase } from "@/lib/mongoose";
import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { ChatEventEnum } from "@/utils/constants";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);


export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string; participantId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId, participantId } = params;
    const { user } = await req.json();

    if (!isValidObjectId(chatId) || !isValidObjectId(participantId)) {
      throw new ApiError({
        statusCode: 400,
        message: "Invalid chat ID or participant ID",
      });
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

    if (groupChat.admin?.toString() !== user._id?.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    if (groupChat.participants.some((p) => p.toString() === participantId)) {
      throw new ApiError({
        statusCode: 400,
        message: "Participant already exists in the group",
      });
    }

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

    emitSocketEvent(
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


export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; participantId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId, participantId } = params;
    const { user } = await req.json();

    if (!isValidObjectId(chatId) || !isValidObjectId(participantId)) {
      throw new ApiError({
        statusCode: 400,
        message: "Invalid chat ID or participant ID",
      });
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

    if (groupChat.admin?.toString() !== user._id?.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    if (!groupChat.participants.some((p) => p.toString() === participantId)) {
      throw new ApiError({
        statusCode: 400,
        message: "Participant does not exist in the group",
      });
    }

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

    emitSocketEvent(
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
