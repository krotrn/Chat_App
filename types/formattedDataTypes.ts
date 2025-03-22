import { FriendRequest } from "@prisma/client";

export interface FormattedFriendRequest extends FriendRequest {
  senderAvatar: string | null;
  senderName: string | null;
  senderUsername: string;
  requestCreatedAt: Date;
}