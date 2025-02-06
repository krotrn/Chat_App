import { connectToDatabase } from "@/lib/mongoose";
import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { ChatEventEnum } from "@/lib/chat/constants";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { groupParamsSchema, userSchema } from "@/schemas/paramsSchema";
import { auth } from "@/auth";

/**
 * Handle Add Participant
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string; participantId: string } }
) {
  try {
    await connectToDatabase();
    const parsedParams = groupParamsSchema.safeParse(params);

    if (!parsedParams.success) {
      return new ApiError({
        statusCode: 400,
        message: parsedParams.error.errors.map((e) => e.message).join(", "),
      });
    }

    const { chatId, participantId } = parsedParams.data;

    const session = await auth();

    if (!session || !session.user?._id) {
      return new ApiError({ statusCode: 401, message: "Unauthorized: Missing or invalid session" });
    }

    const userHeader = session.user._id;

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

    // getting the chatId
    const groupChat: ChatType | null = await Chat.findById(chatId).select(
      "admin participants isGroupChat"
    );

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist.",
      });
    }

    if (groupChat.admin.toString() !== user.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    if (
      groupChat.participants.some(
        (p) => p.toString() === participantId.toString()
      )
    ) {
      throw new ApiError({
        statusCode: 400,
        message: "Participant already exists in the group",
      });
    }

    // add Participant
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

    await emitSocketEvent(
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

/**
 * Kicking from Group
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string; participantId: string } }
) {
  try {
    await connectToDatabase();
    const parsedParams = groupParamsSchema.safeParse(params);

    if (!parsedParams.success) {
      return new ApiError({
        statusCode: 400,
        message: parsedParams.error.errors.map((e) => e.message).join(", "),
      });
    }

    const { chatId, participantId } = parsedParams.data;

    const session = await auth();

    if (!session || !session.user?._id) {
      return new ApiError({ statusCode: 401, message: "Unauthorized: Missing or invalid session" });
    }
    const userHeader = session.user._id;

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

    const { user } = parsedUser.data;

    const groupChat: ChatType | null = await Chat.findById(chatId).select(
      "admin participants isGroupChat"
    );

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist.",
      });
    }

    if (groupChat.admin.toString() !== user.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    if (!groupChat.participants.some((p) => p.toString() === participantId)) {
      throw new ApiError({
        statusCode: 400,
        message: "Participant does not exist in the group",
      });
    }

    // Join Group
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

    await emitSocketEvent(
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
        statusCode: 500,
        message: error ? (error as Error).message : "Internal Server Error",
      })
    );
  }
}
