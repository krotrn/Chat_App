import { ChatType } from "@/types/Chat.type";
import mongoose, { Model, Schema } from "mongoose";

const chatSchema = new Schema<ChatType>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Chat: Model<ChatType> =
  mongoose.models.Chat || mongoose.model<ChatType>("Chat", chatSchema);
