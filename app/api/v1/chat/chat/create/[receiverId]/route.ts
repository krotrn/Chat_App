import { connectToDatabase } from "@/lib/mongoose";
import { receiverIdSchema, userSchema } from "@/schemas/paramsSchema";
import { User } from "@/models/auth/user.models";
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
 * Handle Create Chat one-to-one
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { receiverId: string } }
) {
  try {
    await connectToDatabase();
    const parsedRecieverId = receiverIdSchema.safeParse(params);
    const userHeader = session.user._id;
    const parsedUser = userSchema.safeParse(userHeader);

    if (!parsedUser.success) {
      return NextResponse.json(
        new ApiError({
          statusCode: 401,
          message:
            "Unauthorized" +
            parsedUser.error.errors.map((e) => e.message).join(", "),
        })
      );
    }
    if (!parsedRecieverId.success) {
      return NextResponse.json(
        new ApiError({
          statusCode: 401,
          message:
            "Unauthorized" +
            parsedRecieverId.error.errors.map((e) => e.message).join(", "),
        })
      );
    }
    const { receiverId } = parsedRecieverId.data;
    const { user } = parsedUser.data;

    const receiver = await User.findById(receiverId)
      .select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      )
      .lean();

    if (!receiver) {
      return NextResponse.json(
        new ApiError({ statusCode: 404, message: "User not found" })
      );
    }

    if (receiver._id.toString() === user.toString()) {
      return NextResponse.json(
        new ApiError({
          statusCode: 400,
          message: "You can't chat with yourself",
        })
      );
    }

    // Check if chat already exists
    const existingChat: ChatType[] = await Chat.aggregate([
      {
        $match: {
          isGroupChat: false,
          participants: {
            $all: [
              new mongoose.Types.ObjectId(receiverId),
              new mongoose.Types.ObjectId(user),
            ],
          },
        },
      },
      ...chatCommonAggregation(),
    ]);

    if (existingChat.length) {
      return NextResponse.json(
        new ApiResponse({
          statusCode: 200,
          data: existingChat[0],
          success: true,
        })
      );
    }

    // Create new one-on-one chat
    const newChat: ChatType = await Chat.create({
      chatName: "One on one chat",
      isGroupChat: false,
      participants: [new mongoose.Types.ObjectId(user), receiver._id],
      latestMessage: null,
      admin: new mongoose.Types.ObjectId(user),
      groupAdmin: null,
    });

    // Fetch the created chat with aggregation
    const createdChat: ChatType[] = await Chat.aggregate([
      { $match: { _id: newChat._id } },
      ...chatCommonAggregation(),
    ]);

    if (!createdChat.length) {
      return NextResponse.json(
        new ApiError({ statusCode: 500, message: "Chat not created" })
      );
    }

    const payload: ChatType = createdChat[0];

    // Emit socket event to both participants
    await Promise.all(
      payload.participants.map(async (participantObjectId) =>
        participantObjectId.toString() !== user.toString()
          ? await emitSocketEvent(
              req,
              participantObjectId.toString(),
              ChatEventEnum.NEW_CHAT_EVENT,
              payload
            )
          : null
      )
    );

    return NextResponse.json(
      new ApiResponse({
        statusCode: 201,
        data: payload,
        message: "Chat retrieved successfully",
      })
    );
  } catch (error: unknown) {
    console.error("❌ Error creating one-on-one chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
