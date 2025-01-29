import mongoose from 'mongoose';
export interface ChatType {
  name: string;
  isGroupChat: boolean;
  lastMessage?: mongoose.Schema.Types.ObjectId;
  participants: mongoose.Schema.Types.ObjectId[];
  admin: mongoose.Schema.Types.ObjectId;
}