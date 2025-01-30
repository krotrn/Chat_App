import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/auth/user.models";
import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { chatCommonAggregation } from "@/utils/chatHelper";
import { ChatEventEnum } from "@/utils/constants";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { receiverId: string } }
) {
  try {
    await connectToDatabase();
    const { receiverId } = params;
    const { user } = await req.json();

    if (!user) {
      return NextResponse.json(new ApiError({ statusCode: 401, message: "Unauthorized" }));
    }

    const receiver = await User.findById(receiverId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!receiver) {
      return NextResponse.json(new ApiError({ statusCode: 404, message: "User not found" }));
    }

    if (receiver._id.toString() === user._id.toString()) {
      return NextResponse.json(
        new ApiError({ statusCode: 400, message: "You can't chat with yourself" })
      );
    }

    // ✅ Check if chat already exists
    const existingChat = await Chat.aggregate([
      {
        $match: {
          isGroupChat: false,
          participants: {
            $all: [new mongoose.Types.ObjectId(receiverId), new mongoose.Types.ObjectId(user._id)],
          },
        },
      },
      ...chatCommonAggregation(),
    ]);

    if (existingChat.length > 0) {
      return NextResponse.json(
        new ApiResponse({ statusCode: 200, data: existingChat[0], success: true })
      );
    }

    // ✅ Create new one-on-one chat
    const newChat:ChatType = await Chat.create({
      chatName: "One on one chat",
      isGroupChat: false,
      participants: [user._id, receiver._id],
      latestMessage: null,
      admin: user._id,
      groupAdmin: null,
    });

    // ✅ Fetch the created chat with aggregation
    const createdChat:ChatType[] = await Chat.aggregate([
      { $match: { _id: newChat._id } },
      ...chatCommonAggregation(),
    ]);

    if (!createdChat.length) {
      return NextResponse.json(new ApiError({ statusCode: 500, message: "Chat not created" }));
    }

    const payload = createdChat[0];

    // ✅ Emit socket event to both participants
    await Promise.all(
      payload.participants.map((participantObjectId) =>
        participantObjectId.toString() !== user._id.toString()
          ? emitSocketEvent(req, participantObjectId.toString(), ChatEventEnum.NEW_CHAT_EVENT, payload)
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
    return NextResponse.json(new ApiError({ statusCode: 500, message: (error as NodeJS.ErrnoException).message }));
  }
}
