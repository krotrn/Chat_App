import { FriendshipStatus } from "@prisma/client";

export const handleSuccess = (data: unknown, message: string) => ({
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
  ACCEPTED: "Friend request accepted",
  REJECTED: "Friend request rejected",
  BLOCKED: "User blocked",
  PENDING: "Friend request pending",
};