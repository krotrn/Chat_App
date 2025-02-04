import { connectToDatabase } from "@/lib/mongoose";
import { chatIdSchema, userSchema } from "@/lib/schema.validation";
import { Chat } from "@/models/chat-app/chat.models";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { chatCommonAggregation } from "@/lib/chat/chatHelper";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const isParticipant = (
  participants: mongoose.Types.ObjectId[],
  userId: string
): boolean => {
  return participants.map((id) => id.toString()).includes(userId);
};

/**
 * Handle Leaving Group
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectToDatabase();
    const parsedParams = chatIdSchema.safeParse(params);

    if (!parsedParams.success) {
      return new ApiError({
        statusCode: 400,
        message: parsedParams.error.errors.map((e) => e.message).join(", "),
      });
    }

    const { chatId } = parsedParams.data;

    const userHeader = req.headers.get("user");

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
    if (!isParticipant(groupChat.participants, user)) {
      throw new ApiError({
        statusCode: 400,
        message: "You are not a participant of the group",
      });
    }

    // Remove the participant
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { participants: new mongoose.Types.ObjectId(user) } },
      { new: true, select: "_id participants" }
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
