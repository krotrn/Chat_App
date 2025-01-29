import { MessageType } from "@/types/Message.type";
import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema<MessageType>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
  },
  content: {
    type: String,
    required: true,
  },
  attchments: {
    type: [
      {
        url: String,
        localPath: String,
      },
    ],
    default: [],
  }
}, { timestamps: true });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);