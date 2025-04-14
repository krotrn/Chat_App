"use server";

import { auth } from "@/auth";
import { handleError, handleSuccess } from "@/lib/helper";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import {
  FormattedFriendType,
  SearchUserType,
  StatsProps,
} from "@/types/formattedDataTypes";
import {
  FriendRequest,
  FriendshipStatus,
  RecommendationType,
  User,
} from "@prisma/client";
import { z } from "zod";

interface ResponseType<T> {
  success: boolean;
  error: boolean;
  data?: T;
  message: string;
}

export interface RecommendationWithRelations {
  id: string;
  type: RecommendationType;
  recommendedUser: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
  recommendedGroup: {
    id: string;
    backendId: string;
    name: string;
    avatarUrl: string | null;
    description: string | null;
  } | null;
}

export const getRecommendations = async (): Promise<
  RecommendationWithRelations[]
> => {
  const session = await auth();
  if (!session) throw new Error("User not authenticated");

  try {
    const recommendations = await db.recommendations.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        type: true,
        recommendedUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            username: true,
            bio: true,
          },
        },
        recommendedGroup: {
          select: {
            id: true,
            backendId: true,
            name: true,
            avatarUrl: true,
            description: true,
          },
        },
      },
    });
    return recommendations;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching recommendations:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getActivities = async () => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const activities = await db.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return activities;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching activities:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getUserStats = async <T extends keyof StatsProps>(fields: T[]) => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const select: Partial<Record<keyof StatsProps, boolean>> = fields.reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Partial<Record<keyof StatsProps, boolean>>
    );

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        friends: true,
        ...select,
      },
    });
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user stats:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const updateProfile = async (
  data: z.infer<typeof profileSchema>
): Promise<ResponseType<null>> => {
  const session = await auth();
  if (!session || !session.user.id)
    return handleError("User not authenticated.");

  try {
    const { name, bio, avatar } = data;
    const avatarUrl = avatar ? await uploadAvatar(avatar) : undefined;

    await db.user.update({
      where: { id: session.user.id },
      data: { name, bio, avatarUrl },
    });

    return handleSuccess(null, "Profile updated successfully.");
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error updating profile";
    console.error("Error updating profile:", errorMsg);
    return handleError("An error occurred while updating the profile.");
  }
};

async function uploadAvatar(avatar: File): Promise<string> {
  // TODO
  void avatar;
  return "https://example.com/avatar.jpg";
}

export const getFriendRequests = async <T extends keyof FriendRequest>(
  selectFields: T[]
): Promise<FriendRequest[]> => {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");

  try {
    const select = selectFields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Partial<Record<keyof FriendRequest, boolean>>
    );

    const friendRequests = await db.friendRequest.findMany({
      where: { receiverId: session.user.id, status: FriendshipStatus.PENDING },
      select,
    });

    return friendRequests;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Error retrieving friend requests";
    console.error("Error in getFriendRequests:", errorMsg);
    throw new Error("Error Getting Request.");
  }
};

export const getUserDataById = async <
  T extends Partial<Record<keyof User, boolean>>,
>(
  id: string,
  select: T
) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select,
    });

    if (!user) {
      console.warn(`User with ID ${id} not found.`);
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user data by ID:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getUserFriends = async (
  id: string
): Promise<FormattedFriendType[]> => {
  try {
    const userFriends = await db.userFriends.findMany({
      where: { userId: id },
      select: {
        friend: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
            isOnline: true,
          },
        },
      },
    });

    return userFriends.map((userFriend) => ({
      id: userFriend.friend.id,
      username: userFriend.friend.username,
      name: userFriend.friend.name ?? undefined,
      avatarUrl: userFriend.friend.avatarUrl ?? undefined,
      bio: userFriend.friend.bio ?? undefined,
      isOnline: userFriend.friend.isOnline,
    }));
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error fetching user friends";
    console.error("Error in getUserFriends:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getUserByQuery = async <T extends keyof SearchUserType>(
  contains: string,
  reqData: T[]
) => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  try {
    const select = reqData.reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Partial<Record<keyof SearchUserType, boolean>>
    );
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains, mode: "insensitive" } },
          { username: { contains, mode: "insensitive" } },
          { email: { contains, mode: "insensitive" } },
        ],
        NOT: { id: session.user.id },
      },
      select,
    });

    return users.map((user) => ({
      ...user,
      name: user.name ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
    }));
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error searching users";
    console.error("Error in getUserByQuery:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  try {
    const recentRequestsCount = await db.friendRequest.count({
      where: {
        senderId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentRequestsCount > 20) {
      throw new Error("You've sent too many friend requests recently");
    }

    const existingRequest = await db.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
      },
    });
    if (existingRequest) {
      if (existingRequest.status === FriendshipStatus.BLOCKED) {
        throw new Error("Cannot send friend request");
      }
      throw new Error("Friend request already exists");
    }

    const areFriends = await db.userFriends.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId },
        ],
      },
    });
    if (areFriends) {
      throw new Error("Users are already friends");
    }
    const friendRequest = await db.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });
    return friendRequest;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error sending friend request";
    console.error("Error in sendFriendRequest:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getPendingRequests = async (senderId: string) => {
  try {
    const pendingRequests = await db.friendRequest.findMany({
      where: {
        senderId,
        status: FriendshipStatus.PENDING,
      },
      select: { id: true, receiverId: true },
    });
    return pendingRequests;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Error retrieving pending requests";
    console.error("Error in getPendingRequests:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const handleFriendRequest = async (
  requestId: string,
  receiverId: string,
  action: FriendshipStatus,
  status: FriendshipStatus
) => {
  try {
    // Wrap multi-step operations in a transaction.
    const result = await db.$transaction(async (tx) => {
      const existingRequest = await tx.friendRequest.findFirst({
        where: { id: requestId },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          status: true,
        },
      });

      if (!existingRequest) {
        throw new Error("Friend request not found");
      }

      // Fetch sender and receiver details
      const [sender, receiver] = await Promise.all([
        tx.user.findUnique({
          where: { id: existingRequest.senderId },
          select: { name: true, username: true, avatarUrl: true },
        }),
        tx.user.findUnique({
          where: { id: existingRequest.receiverId },
          select: { name: true, username: true, avatarUrl: true },
        }),
      ]);

      if (!sender || !receiver) {
        throw new Error("User not found");
      }

      // Update friend request status
      await tx.friendRequest.update({
        where: { id: requestId },
        data: {
          status: action === status ? FriendshipStatus.PENDING : action,
        },
      });

      // Process based on action
      if (action === FriendshipStatus.ACCEPTED) {
        // Create bidirectional friendship entries.
        await tx.userFriends.createMany({
          data: [
            {
              userId: existingRequest.senderId,
              friendId: existingRequest.receiverId,
            },
            {
              userId: existingRequest.receiverId,
              friendId: existingRequest.senderId,
            },
          ],
          skipDuplicates: true,
        });

        // Create new friend activity records for both users.
        await tx.activity.createMany({
          data: [
            {
              userId: existingRequest.receiverId,
              userAvatarUrl: receiver.avatarUrl || "",
              userName: receiver.name || receiver.username,
              type: "NEWFRIEND",
              content: `You accepted a friend request from ${sender.name || sender.username}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              userId: existingRequest.senderId,
              userAvatarUrl: sender.avatarUrl || "",
              userName: sender.name || sender.username,
              type: "NEWFRIEND",
              content: `${receiver.name || receiver.username} accepted your friend request`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        });

        // Remove relevant friend request recommendations.
        await tx.recommendations.deleteMany({
          where: {
            OR: [
              {
                userId: existingRequest.senderId,
                recommendedUserId: existingRequest.receiverId,
              },
              {
                userId: existingRequest.receiverId,
                recommendedUserId: existingRequest.senderId,
              },
            ],
            type: RecommendationType.FRIENDREQUEST,
          },
        });
      } else if (action === FriendshipStatus.REJECTED) {
        await tx.activity.create({
          data: {
            userId: existingRequest.senderId,
            userAvatarUrl: sender.avatarUrl || "",
            userName: sender.name || sender.username,
            type: "FRIENDREQUEST",
            content: `${receiver.name || receiver.username} rejected your friend request`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else if (action === FriendshipStatus.BLOCKED) {
        await tx.userFriends.deleteMany({
          where: {
            OR: [
              {
                userId: existingRequest.senderId,
                friendId: existingRequest.receiverId,
              },
              {
                userId: existingRequest.receiverId,
                friendId: existingRequest.senderId,
              },
            ],
          },
        });
      }
      return { success: true };
    });
    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error handling friend request";
    console.error("Error in handleFriendRequest:", errorMsg);
    throw new Error(errorMsg);
  }
};

// Remove friendship between two users using transactions.
export const removeFriend = async (userId: string, friendId: string) => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const result = await db.$transaction(async (tx) => {
      const friendship = await tx.userFriends.findFirst({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (!friendship) {
        return { success: false, message: "Friendship not found" };
      }

      // Delete friendship entries.
      await tx.userFriends.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      const [user, friend] = await Promise.all([
        tx.user.findUnique({
          where: { id: userId },
          select: { name: true, username: true, avatarUrl: true },
        }),
        tx.user.findUnique({
          where: { id: friendId },
          select: { name: true, username: true },
        }),
      ]);

      if (!user || !friend) {
        throw new Error("User or friend not found");
      }

      await tx.activity.create({
        data: {
          userId,
          userAvatarUrl: user.avatarUrl || "",
          userName: user.name || user.username,
          type: "FRIENDREQUEST", // Consider adding a dedicated type if needed.
          content: `You removed ${friend.name || friend.username} from your friends`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Optionally, record a friend request with a "REJECTED" status.
      await tx.friendRequest.create({
        data: {
          senderId: userId,
          receiverId: friendId,
          status: FriendshipStatus.REJECTED,
        },
      });

      return { success: true, message: "Friend removed successfully" };
    });
    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error removing friend";
    console.error("Error in removeFriend:", errorMsg);
    throw new Error(errorMsg);
  }
};

// Block a user by updating or creating a friend request record and deleting any friendship.
export const blockUser = async (userId: string, blockedUserId: string) => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.$transaction(async (tx) => {
      const existingRequest = await tx.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: blockedUserId },
            { senderId: blockedUserId, receiverId: userId },
          ],
        },
      });

      if (existingRequest) {
        await tx.friendRequest.update({
          where: { id: existingRequest.id },
          data: { status: FriendshipStatus.BLOCKED },
        });
      } else {
        await tx.friendRequest.create({
          data: {
            senderId: userId,
            receiverId: blockedUserId,
            status: FriendshipStatus.BLOCKED,
          },
        });
      }

      await tx.userFriends.deleteMany({
        where: {
          OR: [
            { userId, friendId: blockedUserId },
            { userId: blockedUserId, friendId: userId },
          ],
        },
      });
    });

    return { success: true, message: "User blocked successfully" };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error blocking user";
    console.error("Error in blockUser:", errorMsg);
    throw new Error(errorMsg);
  }
};

// Create an activity record for friend-related actions.
export const createFriendActivity = async (
  userId: string,
  targetUserId: string,
  activityType: "FRIENDREQUEST" | "NEWFRIEND",
  content: string
) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true, avatarUrl: true },
    });

    if (!user) throw new Error("User not found");

    await db.activity.create({
      data: {
        userId,
        userAvatarUrl: user.avatarUrl || "",
        userName: user.name || user.username,
        type: activityType,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error creating activity:", error);
  }
};

// Update recommendations after a friend action.
export const updateRecommendationsAfterFriendAction = async (
  userId: string,
  friendId: string,
  action: "ACCEPT" | "REJECT" | "BLOCK"
) => {
  try {
    if (action === "ACCEPT" || action === "BLOCK") {
      await db.recommendations.deleteMany({
        where: {
          OR: [
            { userId, recommendedUserId: friendId },
            { userId: friendId, recommendedUserId: userId },
          ],
          type: RecommendationType.FRIENDREQUEST,
        },
      });
    } else if (action === "REJECT") {
      await db.recommendations.deleteMany({
        where: {
          userId,
          recommendedUserId: friendId,
          type: RecommendationType.FRIENDREQUEST,
        },
      });
    }
  } catch (error) {
    console.error("Error updating recommendations:", error);
  }
};

// Update the user's connection status.
export const updateUserConnectionStatus = async (userId: string) => {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        isOnline: true,
      },
    });
  } catch (error) {
    console.error("Error updating user connection status:", error);
  }
};

export const getFriendshipStatus = async (
  userId: string,
  otherUserId: string
) => {
  try {
    const areFriends = await db.userFriends.findFirst({
      where: { userId, friendId: otherUserId },
    });

    if (areFriends) return "FRIENDS";

    const pendingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    if (pendingRequest) return pendingRequest.status;

    return "NONE";
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Error retrieving friendship status";
    console.error("Error in getFriendshipStatus:", errorMsg);
    throw new Error(errorMsg);
  }
};
