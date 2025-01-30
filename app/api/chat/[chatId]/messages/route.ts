import { NextResponse } from "next/server";
import { Chat } from "@/models/chat-app/chat.models";
import { ChatMessage } from "@/models/chat-app/message.models";
import mongoose from "mongoose";
import { chatMessageCommonAggregation } from "@/utils/chatHelper";
import { getStaticPaths } from "next/dist/build/templates/pages";
import { ChatType } from "@/types/Chat.type";
import { MessageAttachmentType, MessageType } from "@/types/Message.type";
import { emitSocketEvent } from "@/socket";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { removeLocalFile } from "@/utils/Helper";
import { ChatEventEnum } from "@/utils/constants";

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const { user } = await req.json();
  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if (!selectedChat.participants?.includes(user?._id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages: ChatType[] = await ChatMessage.aggregate([
    { $match: { chat: new mongoose.Types.ObjectId(chatId) } },
    ...chatMessageCommonAggregation(),
    { $sort: { createdAt: -1 } },
  ]);

  return NextResponse.json(
    new ApiResponse({
      statusCode: 200,
      data: messages,
      message: "Messages Fetched",
      success: true,
    })
  );
}

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const { content, files, user } = await req.json();
  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) {
    throw new ApiError({
      statusCode: 404,
      message: "Chat Not Found",
      data: null,
    });
  }
  const messageFiles: MessageAttachmentType[] = [];

  if (files && files.attachments?.length > 0) {
    files.attachments?.map((file: { filename: string }) => {
      messageFiles.push({
        url: getStaticPaths(req, file.filename),
        localPath: getStaticPaths(file.filename),
      });
    });
  }

  const message: MessageType = await ChatMessage.create({
    sender: new mongoose.Types.ObjectId(user._id as string),
    content: content || "",
    chat: new mongoose.Types.ObjectId(chatId),
    attachments: messageFiles,
  });

  const chat: ChatType | null = await Chat.findByIdAndUpdate(
    chatId,
    { $set: { lastMessage: message._id } },
    { new: true }
  );

  if (!chat) {
    throw new ApiError({
      statusCode: 404,
      message: "Error in Update",
      data: null,
    });
  }

  const messages: ChatType[] = await ChatMessage.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(message._id.toString()),
      },
    },
    ...chatMessageCommonAggregation(),
  ]);

  const receivedMessage = messages[0];

  if (!receivedMessage) {
    throw new ApiError({
      statusCode: 500,
      message: "Internal server Error",
      data: null,
    });
  }

  chat?.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() !== user._id.toString()) return;
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage
    );
  });

  return NextResponse.json(
    new ApiResponse({
      statusCode: 200,
      data: receivedMessage,
      message: "Message Sent",
      success: true,
    })
  );
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const { chatId, messageId } = params;
  const { user } = await req.json();

  const chat: ChatType | null = await Chat.findById({
    _id: new mongoose.Types.ObjectId(chatId),
    participants: new mongoose.Types.ObjectId(user._id),
  });

  if (!chat) {
    throw new ApiError({
      statusCode: 404,
      message: "Chat not found",
    });
  }

  const message: MessageType | null = await ChatMessage.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(messageId),
  });

  if (!message) {
    throw new ApiError({ statusCode: 404, message: "Message does not exist." });
  }

  if (message.sender.toString() !== user._id.toString()) {
    throw new ApiError({
      statusCode: 404,
      message:
        "You are not the authorised to delete the message, you are not the sender",
    });
  }

  if (message.attachments.length > 0) {
    message.attachments.map((asset) => {
      removeLocalFile(asset.localPath);
    });
  }

  await ChatMessage.deleteOne({ _id: new mongoose.Types.ObjectId(messageId) });

  if (chat.lastMessage?.toString() === message._id.toString()) {
    const lastMessage = await ChatMessage.findOne(
      { chat: chatId },
      {},
      { sort: { createdAt: -1 } }
    );

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: lastMessage?._id || null,
    });
  }

  chat.participants.forEach((participantObjectId) => {
    if (participantObjectId.toString() === user._id.toString()) return;
    emitSocketEvent(
      req,
      participantObjectId.toString(),
      ChatEventEnum.MESSAGE_DELETE_EVENT,
      message
    );
  });

  return NextResponse.json(new ApiResponse({ statusCode: 200, data: message }));
}
