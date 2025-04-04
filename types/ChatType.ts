import { UserFriends } from "@prisma/client";

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface ParticipantsType {
  userId: string;
  name: string;
  avatarUrl: string;
  role: "member" | "admin";
  joinedAt: Date;
}


export interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  replyToId?: string;
  reactions?: Array<{
    userId: string;
    emoji: string;
  }>;
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  lastMessage?: Message;
  messages: Message[];
  participants?: string[];
  adminIds?: string[];
  unreadCount: number;
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
  friends?: string[]; // IDs of friends
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