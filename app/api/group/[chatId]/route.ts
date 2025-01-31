import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { chatCommonAggregation } from "@/utils/chatHelper";
import { ChatEventEnum } from "@/utils/constants";
import mongoose, { isValidObjectId } from "mongoose";
import { DELETE as DeleteChatMessage } from "@/app/api/chat/[chatId]/route";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";

// Fetch group chat details
export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    await connectToDatabase();
    const { chatId } = params;

    if (!isValidObjectId(chatId)) {
      return NextResponse.json(new ApiResponse({statusCode:500, message:"Not VaildId"}))
    }

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
    const { chatId } = params;
    const { name } = await req.json();
    const user = req.headers.get("user");

    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    if (!isValidObjectId(chatId)) {
      return NextResponse.json(new ApiResponse({statusCode:500, message:"Not VaildId"}))
    }

    const groupChat = await Chat.findById(chatId).lean();

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist",
      });
    }

    if (groupChat.admin?.toString() !== user.toString()) {
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
    const { chatId } = params;
    const user = req.headers.get("user");

    if (!user) {
      return NextResponse.json(
        new ApiError({ statusCode: 401, message: "Unauthorized" })
      );
    }

    const groupChat = await Chat.findById(chatId).lean();

    if (!groupChat || !groupChat.isGroupChat) {
      throw new ApiError({
        statusCode: 404,
        message: "Group chat does not exist",
      });
    }

    if (groupChat.admin?.toString() !== user.toString()) {
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
