"use server";

import { deleteMessage, sendMessage } from "@/services/message";
import { AttachmentResponse, MessageType } from "@/types/ChatType";
import { deleteFileFromCloudinary } from "../user";
import { uploadToCloudinary } from "../shared/cloudinary";
import {
  handleActionError,
  validateRequiredParams,
} from "../../lib/utils/utils";

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
  try {
    validateRequiredParams({ chatId, content, token });

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
  } catch (error) {
    const errorMessage = handleActionError(error, "Failed to send message");
    console.error("Error sending message:", errorMessage);
    throw new Error(errorMessage);
  }
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
  try {
    validateRequiredParams({ message, token });

    if (message.attachments.length > 0) {
      const deletionPromises = message.attachments.map((attachment) =>
        deleteFileFromCloudinary(attachment.public_id, attachment.type),
      );

      await Promise.allSettled(deletionPromises);
    }

    return deleteMessage({
      messageId: message._id,
      chatId: message.chatId,
      token,
      forEveryone,
    });
  } catch (error) {
    const errorMessage = handleActionError(error, "Failed to delete message");
    console.error("Error deleting message:", errorMessage);
    throw new Error(errorMessage);
  }
}

const uploadAttachment = async (file: File): Promise<AttachmentResponse> => {
  try {
    validateRequiredParams({ file });

    const preset = process.env.CLOUDINARY_CHAT_FILE_UPLOAD_PRESET;
    if (!preset) {
      throw new Error(
        "Missing Cloudinary chat upload preset in environment variables.",
      );
    }

    const result = await uploadToCloudinary(file, {
      preset,
    });

    return {
      url: result.secure_url,
      type: result.resource_type as "image" | "video" | "raw" | "auto",
      name: file.name,
      size: Math.round(result.bytes / 1024).toString(),
      public_id: result.public_id,
    };
  } catch (error) {
    const errorMessage = handleActionError(error, "Failed to upload file");
    console.error("Error uploading attachment:", errorMessage);
    throw new Error(errorMessage);
  }
};
