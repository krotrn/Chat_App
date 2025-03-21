import { UserFriends } from "@prisma/client";

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  replyToId?: string;
  reactions?: MessageReaction[];
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}
export interface Chat {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
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