import { connectToDatabase } from "@/lib/mongoose";
import { groupParticipantsSchema } from "@/schemas/paramsSchema";
import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { chatCommonAggregation } from "@/lib/chat/chatHelper";
import { ChatEventEnum } from "@/lib/chat/constants";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
/**
 * Handle Group Creation
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const parsedBody = groupParticipantsSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 401,
          message: parsedBody.error.errors.map((e) => e.message).join(", "),
        })
      );
    }
    const { name, participants } = parsedBody.data;
    const session = await auth();

    if (!session || !session.user?._id) {
      return new ApiError({
        statusCode: 401,
        message: "Unauthorized: Missing or invalid session",
      });
    }
    const user: string | null = session.user._id;

    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }
    // Ensure creator is not in the participants list
    if (participants.some((id: string) => id.toString() === user.toString())) {
      throw new ApiError({
        statusCode: 400,
        message: "Participants array should not contain the group creator",
      });
    }

    // Create a unique members array
    const members = Array.from(
      new Set([...participants, user].map((id) => id.toString()))
    ).map((id) => new mongoose.Types.ObjectId(id));

    if (members.length < 3) {
      throw new ApiError({
        statusCode: 400,
        message: "A group chat must have at least 3 distinct participants.",
      });
    }

    // Create the group chat
    const groupChat: ChatType = await Chat.create({
      name,
      isGroupChat: true,
      participants: members,
      admin: new mongoose.Types.ObjectId(user),
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
      payload.participants
        .filter(
          (participantObjectId) =>
            participantObjectId.toString() !== user.toString()
        )
        .map((participantObjectId) =>
          emitSocketEvent(
            req,
            participantObjectId.toString(),
            ChatEventEnum.NEW_CHAT_EVENT,
            payload
          )
        )
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
    throw new ApiError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
