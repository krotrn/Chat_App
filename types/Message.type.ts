import mongoose from "mongoose";

export interface MessageType {
  sender: mongoose.Schema.Types.ObjectId;
  chat: mongoose.Schema.Types.ObjectId;
  content: string;
  attchments: {
    url: string;
    localPath: string;
  }[];
}