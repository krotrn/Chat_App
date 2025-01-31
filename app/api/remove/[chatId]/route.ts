import { Chat } from "@/models/chat-app/chat.models";
import { ApiError } from "@/utils/ApiError";
import { chatCommonAggregation } from "@/utils/chatHelper";
import mongoose, { isValidObjectId } from "mongoose";
import { DELETE as DeleteChatMessage } from "@/app/api/chat/[chatId]/route";
import { NextRequest, NextResponse } from "next/server";
import { ChatType } from "@/types/Chat.type";
import { emitSocketEvent } from "@/socket";
import { ChatEventEnum } from "@/utils/constants";
import { ApiResponse } from "@/utils/ApiResponse";
import { connectToDatabase } from "@/lib/mongoose";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId } = params;
    const user = req.headers.get("user");

    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    if (
      !isValidObjectId(chatId) ||
      !isValidObjectId(user)
    ) {
      throw new ApiError({
        statusCode: 400,
        message: "Invalid chat ID or user ID",
      });
    }

    // Step 1: Fetch chat details first (to avoid unnecessary aggregation)
    const existingChat = await Chat.findById(chatId)
      .select("participants")
      .lean();

    if (!existingChat) {
      throw new ApiError({ statusCode: 404, message: "Chat not found" });
    }

    // Step 2: Fetch chat data with aggregation
    const chatData: ChatType[] = await Chat.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(chatId) } },
      ...chatCommonAggregation(),
    ]);

    if (!chatData.length) {
      throw new ApiError({
        statusCode: 404,
        message: "Chat not found after aggregation",
      });
    }

    const payload: ChatType = chatData[0];

    // Step 3: Remove the chat and associated messages concurrently
    await Promise.all([
      Chat.findByIdAndDelete(chatId),
      DeleteChatMessage(req, { params: { chatId } }), // Ensure this function properly deletes messages
    ]);

    // Step 4: Notify all remaining participants
    const remainingParticipants = existingChat.participants.filter(
      (participant) => participant.toString() !== user.toString()
    );

    if (remainingParticipants.length > 0) {
      remainingParticipants.forEach((participant) => {
        emitSocketEvent(
          req,
          participant.toString(),
          ChatEventEnum.LEAVE_CHAT_EVENT,
          payload
        );
      });
    }

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: {},
        message: "Chat deleted successfully",
      })
    );
  } catch (error) {
    console.error("Error in DELETE /chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: error instanceof ApiError ? error.statusCode : 500,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      })
    );
  }
}
