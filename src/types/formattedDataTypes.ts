import { FriendRequest } from "@prisma/client";

export interface FriendRequestType extends FriendRequest {
  senderAvatar: string | null;
  senderName: string | null;
  senderUsername: string;
  requestCreatedAt: Date;
}

export interface FormattedFriendType {
  id: string;
  name?: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

export interface StatsProps {
  totalFriends: number;
  totalGroups: number;
}

export interface SearchUserType {
  id: string;
  name?: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isFriend: boolean;
  mutualFriendsCount: number;
  hasSentRequest: boolean;
  hasIncomingRequest: boolean;
}

export interface PendingRequestsType {
  id: string;
}
