import { FriendshipStatus } from "@prisma/client";

export const handleSuccess = <T>(data: T, message: string) => ({
  success: true,
  error: false,
  data,
  message,
});

export const handleError = (message: string) => ({
  success: false,
  error: true,
  message,
});

export const actionMessages: Record<FriendshipStatus, string> = {
  FRIENDS: "You are now friends",
  NONE: "No action taken",
  REJECTED: "Friend request rejected",
  BLOCKED: "User blocked",
  PENDING: "Friend request pending",
};
