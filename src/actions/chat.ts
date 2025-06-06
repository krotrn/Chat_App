"use server";

import { deleteMessage, sendMessage } from "@/services/message";
import { AttachmentResponse, MessageType } from "@/types/ChatType";
import { deleteFileFromCloudinary } from "./userUtils";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  sync: true,
});

export async function sendMessageAction({
  chatId,
  content,
  replyToId,
  attachments = [],
  token,
}: {
  chatId: string;
  content: string;
  replyToId?: string;
  attachments?: File[];
  token: string;
}) {
  const uploadedAttachments = await Promise.all(
    attachments.map(async (file) => await uploadAttachment(file)),
  );
  return sendMessage({
    chatId,
    content,
    replyToId,
    attachments: uploadedAttachments,
    token,
  });
}

export async function deleteMessageAction({
  message,
  token,
  forEveryone = false,
}: {
  message: MessageType;
  token: string;
  forEveryone?: boolean;
}) {
  if (message.attachments.length > 0) {
    const files = message.attachments.map((attachment) => ({
      publicId: attachment.public_id,
      resourceType: attachment.type,
    }));

    await deleteFileFromCloudinary(files);
  }

  return deleteMessage({
    messageId: message._id,
    chatId: message.chatId,
    token,
    forEveryone,
  });
}

const uploadAttachment = async (file: File): Promise<AttachmentResponse> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_CHAT_FILE_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error(
      "Missing Cloudinary configuration in environment variables.",
    );
  }

  if (!file || file.size === 0) {
    throw new Error("Invalid file.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      {
        upload_preset: preset,
      },
    );

    if (!response) {
      throw new Error("Failed to upload file to Cloudinary");
    }

    return {
      url: response.secure_url,
      type: response.resource_type,
      name: file.name,
      size: Math.round(response.bytes / 1024).toString(),
      public_id: response.public_id,
    };
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new Error("Failed to upload files to Cloudinary");
  }
};
