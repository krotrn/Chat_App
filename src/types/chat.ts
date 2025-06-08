import type { MessageType, DeletedForEntry } from "./message";

export interface ParticipantsType {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: "member" | "admin";
  joinedAt: Date;
}

export interface ChatType {
  _id: string;
  name: string;
  lastMessage: MessageType | null;
  avatarUrl: string;
  participants: ParticipantsType[];
  admin: string;
  type: "direct" | "group" | "channel";
  createdBy: string;
  deletedFor: DeletedForEntry[];
  metadata?: {
    pinnedMessage: string[];
    customPermissions?: string[];
  };
  messages: MessageType[];
  createdAt: Date;
  updatedAt: Date;
}
