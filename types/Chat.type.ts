import mongoose from 'mongoose';
export interface ChatType extends mongoose.Document<mongoose.Types.ObjectId> {
  name: string;
  isGroupChat: boolean;
  lastMessage?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
}