import { FriendRequest, UserFriends } from "@prisma/client";

export interface FormattedFriendRequestType extends FriendRequest {
  senderAvatar: string | null;
  senderName: string | null;
  senderUsername: string;
  requestCreatedAt: Date;
}

export interface FormattedFriendType {
  id: string;
  name?: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isOnline: boolean;
}

export interface StatsProps {
  friends: UserFriends[];
}

export interface SearchUserType {
  id: string;
  name?: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface PendingRequestsType{
  id: string;
}