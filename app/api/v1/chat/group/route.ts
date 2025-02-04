import { connectToDatabase } from "@/lib/mongoose";
import { groupParticipantsSchema } from "@/lib/zod";
import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { chatCommonAggregation } from "@/lib/chat/chatHelper";
import { ChatEventEnum } from "@/lib/chat/constants";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

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
    const user: string | null = req.headers.get("user");

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
    const members: mongoose.Types.ObjectId[] = [
      ...new Set([
        ...participants.map(
          (participant: string) =>
            new mongoose.Types.ObjectId(participant.toString())
        ),
        new mongoose.Types.ObjectId(user.toString()),
      ]),
    ];

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
      payload.participants.map(async (participantObjectId) => {
        if (participantObjectId.toString() !== user.toString()) {
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
