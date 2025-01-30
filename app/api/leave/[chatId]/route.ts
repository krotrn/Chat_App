import { Chat } from "@/models/chat-app/chat.models";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { chatCommonAggregation } from "@/utils/chatHelper";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const isParticipant = (
  participants: mongoose.Schema.Types.ObjectId[],
  userId: string
): boolean => {
  return participants.map((id) => id.toString()).includes(userId);
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    const { user } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(user._id)
    ) {
      throw new ApiError({
        statusCode: 400,
        message: "Invalid chat ID or user ID",
      });
    }

    // Fetch the group chat
    const groupChat = await Chat.findById(chatId)
      .select("participants isGroupChat")
      .lean();

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist.",
      });
    }

    // Check if the user is a participant
    if (!isParticipant(groupChat.participants, user._id)) {
      throw new ApiError({
        statusCode: 400,
        message: "You are not a participant of the group",
      });
    }

    // Remove the participant
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: user._id } },
      { new: true, select: "_id participants" } // Return only necessary fields
    ).lean();

    if (!updatedChat) {
      throw new ApiError({
        statusCode: 500,
        message: "Error removing participant from the group",
      });
    }

    // Fetch updated chat data with aggregations
    const chat: ChatType[] = await Chat.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(updatedChat._id.toString()),
        },
      },
      ...chatCommonAggregation(),
    ]);

    if (!chat.length) {
      throw new ApiError({ statusCode: 404, message: "Chat not found" });
    }

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: chat[0],
        message: "Participant removed successfully",
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
