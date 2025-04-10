import { UserFriends } from "@prisma/client";

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface AttachmentResponse {
  name: string;
  url: string;
  localPath: string;
  type: string;
  status: "sent" | "delivered" | "read";
}

export interface ParticipantsType {
  userId: string;
  name: string;
  avatarUrl: string;
  role: "member" | "admin";
  joinedAt: Date;
}

export enum StatusEnum {
  "sent",
  "delivered",
  "read",
}

export interface MessageType {
  _id: string;
  sender: string;
  receivers: ParticipantsType[];
  chatId: string;
  content: string;
  attachments: AttachmentResponse[];
  status: StatusEnum;
  reactions: MessageReaction[];
  edited: {
    isEdited: boolean;
    editedAt: Date;
    PreviousContent: string[];
  };
  isDeleted: boolean;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeletedForEntry {
  userId: string;
  deletedAt: Date;
}

export interface ChatType {
  _id: string;
  name: string;
  lastMessage?: MessageType | null;
  messages?: MessageType[];
  avatar: string;
  participants: ParticipantsType[];
  admin: string;
  type: "direct" | "group" | "channel";
  createdBy: string;
  deletedFor: DeletedForEntry[];
  metadata: {
    pinnedMessage: string[];
    customePermissions?: unknown;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  avatar: string;
  apiKey: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  models?: AIModel[];
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  bio?: string;
  role: "admin" | "user";
  status?: "online" | "offline" | "away";
  lastSeen?: string;
  friends?: string[];
  friendRequests?: {
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  };
  recentActivities?: Activity[];
  recommendations?: Recommendation[];
}

export interface Activity {
  id: string;
  type: "message" | "friend_request" | "new_friend";
  content: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export interface Recommendation {
  id: string;
  type: "friend" | "group";
  title: string;
  description: string;
  avatarUrl: string;
}

export interface statsProps {
  username: string;
  email: string;
  avatarUrl: string | null;
  name: string | null;
  bio: string | null;
  lastLogin: Date | null;
  friends: UserFriends[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
