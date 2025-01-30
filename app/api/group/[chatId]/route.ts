import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { chatCommonAggregation } from "@/utils/chatHelper";
import { ChatEventEnum } from "@/utils/constants";
import mongoose from "mongoose";
import { DELETE as DeleteChatMessage } from "@/app/api/chat/[chatId]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET({ params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const groupChat: ChatType[] = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat: ChatType = groupChat[0];

  if (!chat) {
    throw new ApiError({
      statusCode: 404,
      message: "Group chat does not exist.",
    });
  }

  return NextResponse.json(
    new ApiResponse({
      statusCode: 200,
      data: chat,
      message: "Group chat fetched successfully",
    })
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const { name, user } = await req.json();

  // check for chat existence
  const groupChat = await Chat.findOne({
    _id: new mongoose.Types.ObjectId(chatId),
    isGroupChat: true,
  });

  if (!groupChat) {
    throw new ApiError({
      statusCode: 404,
      message: "Group chat does not exist",
    });
  }

  // only admin can change the name
  if (groupChat.admin?.toString() !== user._id?.toString()) {
    throw new ApiError({ statusCode: 404, message: "You are not an admin" });
  }

  const updatedGroupChat: ChatType | null = await Chat.findByIdAndUpdate(
    chatId,
    {
      $set: {
        name,
      },
    },
    { new: true }
  );

  if (!updatedGroupChat) {
    throw new ApiError({
      statusCode: 500,
      message: "Server Error in updating Name",
    });
  }

  const chat: ChatType[] = await Chat.aggregate([
    {
      $match: {
        _id: updatedGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload: ChatType = chat[0];

  if (!payload) {
    throw new ApiError({ statusCode: 500, message: "Internal server error" });
  }

  payload.participants.forEach((participantObjectId) => {
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.UPDATE_GROUP_NAME_EVENT,
      payload
    );
  });

  return NextResponse.json(
    new ApiResponse({
      statusCode: 200,
      data: chat[0],
      message: "Group chat name updated successfully",
    })
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const { user } = await req.json();

  const groupChat: ChatType[] = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        isGroupChat: true,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const chat: ChatType = groupChat[0];

  if (!chat) {
    throw new ApiError({
      statusCode: 404,
      message: "Group chat does not exist",
    });
  }

  // check if the user who is deleting is the group admin
  if (chat.admin?.toString() !== user._id?.toString()) {
    throw new ApiError({
      statusCode: 404,
      message: "Only admin can delete the group",
    });
  }

  await Chat.findByIdAndDelete(chatId);

  await DeleteChatMessage({ params: { chatId } });

  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() === user._id.toString()) return;
    emitSocketEvent(
      req,
      participantObjectId?.toString(),
      ChatEventEnum.LEAVE_CHAT_EVENT,
      chat
    );
  });

  return NextResponse.json(
    new ApiResponse({
      statusCode: 200,
      data: {},
      message: "Group chat deleted successfully",
    })
  );
}
