import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { chatCommonAggregation } from "@/utils/chatHelper";
import { ChatEventEnum } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, participants, user } = await req.json();

    // Ensure creator is not in the participants list
    if (
      participants.some((id: string) => id.toString() === user._id.toString())
    ) {
      throw new ApiError({
        statusCode: 400,
        message: "Participants array should not contain the group creator",
      });
    }

    // Create a unique members array
    const members = [...new Set([...participants, user._id.toString()])];

    if (members.length < 3) {
      throw new ApiError({
        statusCode: 400,
        message: "A group chat must have at least 3 distinct participants.",
      });
    }

    // Create the group chat
    const groupChat: ChatType = await Chat.create({
      name,
      isGroupChar: true,
      participants: members,
      admin: user._id,
    });

    // Fetch chat details with aggregation
    const chat: ChatType[] = await Chat.aggregate([
      { $match: { _id: groupChat._id } },
      ...chatCommonAggregation(),
    ]);

    const payload = chat[0];

    if (!payload) {
      throw new ApiError({
        statusCode: 500,
        message: "Failed to fetch chat details",
      });
    }

    // Emit socket events to all participants except the creator
    await Promise.all(
      payload.participants.map(async (participantObjectId) => {
        if (participantObjectId.toString() !== user._id.toString()) {
          await emitSocketEvent(
            req,
            participantObjectId.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            payload
          );
        }
      })
    );

    return NextResponse.json(
      new ApiResponse({
        statusCode: 201,
        data: payload,
        message: "Group chat created successfully",
      })
    );
  } catch (error: unknown) {
    console.error("❌ Error creating group chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
