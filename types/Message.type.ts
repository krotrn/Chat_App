import mongoose from "mongoose";

export interface MessageAttachmentType {
  url: string;
  localPath: string;
}

export interface MessageType extends mongoose.Document<mongoose.Schema.Types.ObjectId> {
  sender: mongoose.Schema.Types.ObjectId;
  chat: mongoose.Schema.Types.ObjectId;
  content: string;
  attachments: MessageAttachmentType[];
}
