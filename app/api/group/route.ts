import { Chat } from "@/models/chat-app/chat.models";
import { emitSocketEvent } from "@/socket";
import { ChatType } from "@/types/Chat.type";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { chatCommonAggregation } from "@/utils/chatHelper";
import { ChatEventEnum } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, participants, user } = await req.json();

  if (participants.includes(user._id).toString()) {
    throw new ApiError({
      statusCode: 400,
      message: "Participants array should not contain the group creator",
    });
  }

  const members = [...new Set([...participants, user._id.toString()])];

  if (members.length < 3) {
    throw new ApiError({
      statusCode: 400,
      message: "Seems like you have passed duplicate participants.",
    });
  }

  const groupChat: ChatType = await Chat.create({
    name,
    isGroupChar: true,
    participants: members,
    admin: user._id,
  });

  const chat: ChatType[] = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = chat[0];

  if (!payload) {
    throw new ApiError({ statusCode: 500, message: "Internal server error" });
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
      message: "Group chat created successfully",
    })
  );
}
