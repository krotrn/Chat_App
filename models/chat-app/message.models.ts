import { MessageType } from "@/types/Message.type";
import mongoose, { Model, Schema } from "mongoose";

const chatMessageSchema = new Schema<MessageType>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      index: true,
    },
    content: {
      type: String,
      required: true,
      index: true,
    },
    attachments: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const ChatMessage: Model<MessageType> =
  mongoose.models.ChatMessage ||
  mongoose.model<MessageType>("ChatMessage", chatMessageSchema);
