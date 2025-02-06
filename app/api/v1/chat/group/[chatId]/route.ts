import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { chatCommonAggregation } from "@/lib/chat/chatHelper";
import { ChatEventEnum } from "@/lib/chat/constants";
import mongoose from "mongoose";
import { DELETE as DeleteChatMessage } from "@/app/api/v1/chat/chat/[chatId]/route";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { chatIdSchema, userSchema } from "@/schemas/paramsSchema";
import { auth } from "@/auth";

// Fetch group chat details
export async function GET(
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

    // Get Group Chats
    const groupChat: ChatType[] = await Chat.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(chatId), isGroupChat: true },
      },
      ...chatCommonAggregation(),
    ]);

    if (!groupChat.length) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist.",
      });
    }

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: groupChat[0],
        message: "Group chat fetched successfully",
      })
    );
  } catch (error: unknown) {
    console.error("❌ Error fetching group chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}

// Update group chat name
export async function PATCH(
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
    const { name } = await req.json();
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

    const groupChat = await Chat.findById(chatId).lean();

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist",
      });
    }

    if (groupChat.admin.toString() !== user.toString()) {
      throw new ApiError({ statusCode: 403, message: "You are not an admin" });
    }

    const updatedGroupChat: ChatType | null = await Chat.findByIdAndUpdate(
      chatId,
      { $set: { name } },
      { new: true, lean: true }
    ).lean();

    if (!updatedGroupChat) {
      throw new ApiError({
        statusCode: 500,
        message: "Server error updating group name",
      });
    }

    const chat: ChatType[] = await Chat.aggregate([
      { $match: { _id: updatedGroupChat._id } },
      ...chatCommonAggregation(),
    ]);

    const payload = chat[0];

    if (!payload) {
      throw new ApiError({
        statusCode: 500,
        message: "Failed to retrieve updated chat",
      });
    }

    await Promise.all(
      payload.participants.map((participant) =>
        emitSocketEvent(
          req,
          participant.toString(),
          ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
          payload
        )
      )
    );

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        data: payload,
        message: "Group chat name updated successfully",
      })
    );
  } catch (error: unknown) {
    console.error("❌ Error updating group chat name:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}

// Delete group chat
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

    const groupChat = await Chat.findById(chatId).lean();

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist",
      });
    }

    if (groupChat.admin.toString() !== user.toString()) {
      throw new ApiError({
        statusCode: 403,
        message: "Only admin can delete the group",
      });
    }

    await Chat.findByIdAndDelete(chatId);

    // Ensure chat messages deletion happens before emitting events
    await DeleteChatMessage(req, { params: { chatId } });

    await Promise.all(
      groupChat.participants.map((participant) =>
        emitSocketEvent(
          req,
          participant.toString(),
          ChatEventEnum.LEAVE_CHAT_EVENT,
          groupChat
        )
      )
    );

    return NextResponse.json(
      new ApiResponse({
        statusCode: 200,
        message: "Group chat deleted successfully",
      })
    );
  } catch (error: unknown) {
    console.error("❌ Error deleting group chat:", error);
    return NextResponse.json(
      new ApiError({
        statusCode: 500,
        message: (error as NodeJS.ErrnoException).message,
      })
    );
  }
}
