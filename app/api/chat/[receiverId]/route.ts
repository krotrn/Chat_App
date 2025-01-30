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

    const receiver = await User.findById(receiverId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!receiver) {
      throw new ApiError({ statusCode: 404, message: "User not found" });
    }

    const { user } = await req.json();
    if (!user) throw new ApiError({ statusCode: 401, message: "Unauthorized" });

    if (receiver._id.toString() === user._id.toString()) {
      throw new ApiError({
        statusCode: 400,
        message: "You can't chat with yourself",
      });
    }

    const chat: ChatType | null = await Chat.findOne([
      {
        $match: {
          isGroupChat: false,
          $and: [
            {
              participants: {
                $eleMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
              },
            },
          ],
        },
      },
      ...chatCommonAggregation(),
    ]);

    if (chat) {
      return NextResponse.json(
        new ApiResponse({ statusCode: 200, data: chat, success: true })
      );
    }

    const newChatInstance: ChatType = new Chat({
      chatName: "One on one chat",
      isGroupChat: false,
      participants: [user._id, receiver._id],
      latestMessage: null,
      admin: user._id,
      groupAdmin: null,
    });

    const createdChat: ChatType[] = await Chat.aggregate([
      {
        $match: {
          _id: newChatInstance._id,
        },
      },
      ...chatCommonAggregation(),
    ]);

    const payload = createdChat[0];
    if (!payload) {
      throw new ApiError({ statusCode: 500, message: "Chat not created" });
    }

    payload.participants.forEach((participantObjectId) => {
      if (participantObjectId.toString() === user._id.toString()) return;
      emitSocketEvent(
        req,
        participantObjectId.toString(),
        ChatEventEnum.NEW_CHAT_EVENT,
        payload
      );
    });

    return NextResponse.json(
      new ApiResponse({
        statusCode: 201,
        data: payload,
        message: "Chat retrieved successfully",
      })
    );
  } catch (error) {
    throw new ApiError({
      statusCode: 500,
      message: "Server Error",
      data: error,
    });
  }
}
