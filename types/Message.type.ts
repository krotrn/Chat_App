import mongoose from "mongoose";

export interface MessageAttachmentType {
  url: string;
  localPath: string;
}

export interface MessageType
  extends mongoose.Document<mongoose.Types.ObjectId> {
  sender: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
  content: string;
  attachments: MessageAttachmentType[];
}
