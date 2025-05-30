import { FriendRequest, UserFriends } from "@prisma/client";

export interface FriendRequestType extends FriendRequest {
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
  name?: string;
  avatarUrl?: string;
  isFriend: boolean;
  id: string;
  email: string;
  username: string;
  friends: {
    id: string;
    friendId: string;
  }[];
}

export interface PendingRequestsType {
  id: string;
}
