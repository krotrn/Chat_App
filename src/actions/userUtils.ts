"use server";

import { auth } from "@/auth";
import { handleError, handleSuccess } from "@/lib/helper";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { createAGroupChat, deleteGroupChat } from "@/services/chat";
import { updateUserWebhook } from "@/services/webhook/user";
import { ParticipantsType } from "@/types/ChatType";
import {
  FriendRequestType,
  FormattedFriendType,
  StatsProps,
  SearchUserType,
} from "@/types/formattedDataTypes";
import {
  ActivityType,
  FriendshipStatus,
  GroupMemberRole,
  RecommendationType,
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

/**
 * Retrieve recommendations for the current authenticated user.
 */
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

/**
 * Get recent activities for the authenticated user.
 */
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

/**
 * Fetch user statistics based on the selected fields.
 */
export const getUserStats = async (): Promise<StatsProps> => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const user = await db.user.findFirst({
      where: { id: session.user.id },
      select: {
        _count: {
          select: {
            createdGroups: true,
            groupMemberships: true,
            friendOf: true,
          },
        },
      },
    });
    if (!user) throw new Error("User not found");
    return {
      totalFriends: user._count.friendOf || 0,
      totalGroups: user._count.groupMemberships || 0,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user stats:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Update the profile of the authenticated user.
 */
export const updateProfile = async (
  data: z.infer<typeof profileSchema>,
): Promise<
  ResponseType<{
    id: string;
    name: string;
    bio: string;
    avatarUrl: string;
    status: string;
  }>
> => {
  const session = await auth();
  if (!session || !session.user.id)
    return handleError("User not authenticated.");

  try {
    const { name, bio, avatar, status } = data;
    const avatarUrl = avatar
      ? await uploadAvatar(avatar)
      : session.user.avatarUrl;

    const user = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { name, bio, avatarUrl, status },
        select: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true,
          status: true,
        },
      });
      await updateUserWebhook(session.accessToken, {
        name: name,
        avatarUrl,
      });
      return user;
    });

    return handleSuccess(
      {
        id: user.id,
        name: user.name || session.user.name || "No Name",
        bio: user.bio || session.user.bio || "No Bio",
        avatarUrl: user.avatarUrl || session.user.avatarUrl || "No Avatar",
        status: user.status || "No Status",
      },
      "Profile updated successfully.",
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error updating profile";
    console.error("Error updating profile:", errorMsg);
    return handleError("An error occurred while updating the profile.");
  }
};

/**
 * Upload user avatar and return the URL.
 */
async function uploadAvatar(avatar: File): Promise<string> {
  // TODO: Implement actual upload logic.
  void avatar;
  return "https://example.com/avatar.jpg";
}

/**
 * Retrieve pending friend requests for the authenticated user.
 */
export const getFriendRequests = async (): Promise<FriendRequestType[]> => {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");

  try {
    const response = await db.friendRequest.findMany({
      where: { receiverId: session.user.id, status: FriendshipStatus.PENDING },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
      },
    });

    const friendRequests = response.map((request) => ({
      senderAvatar: null,
      senderName: null,
      senderUsername: request.sender.username,
      requestCreatedAt: new Date(),
      status: FriendshipStatus.PENDING,
      id: request.id,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      senderId: request.senderId,
      receiverId: request.receiverId,
      expiresAt: request.expiresAt,
    }));

    return friendRequests;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Error retrieving friend requests";
    console.error("Error in getFriendRequests:", errorMsg);
    throw new Error("Error getting requests.");
  }
};

/**
 * Retrieve user data by ID with specific selected fields.
 */
export const getUserDataById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
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

/**
 * Retrieve friends for a specific user ID and map to a formatted structure.
 */
export const getUserFriends = async (
  id: string,
): Promise<FormattedFriendType[]> => {
  try {
    const userFriends = await db.userFriends.findMany({
      where: { userId: id },
      select: {
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return userFriends.map((userFriend) => ({
      id: userFriend.friend.id,
      username: userFriend.friend.username,
      name: userFriend.friend.name ?? undefined,
      email: userFriend.friend.email,
      avatarUrl: userFriend.friend.avatarUrl ?? undefined,
      bio: userFriend.friend.bio ?? undefined,
    }));
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error fetching user friends";
    console.error("Error in getUserFriends:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Retrieve users based on a search query while excluding the authenticated user.
 */

export const searchPeople = async ({
  contains,
}: {
  contains: string;
}): Promise<SearchUserType[]> => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!contains || contains.trim().length < 2) {
    throw new Error("Search query must be at least 2 characters long.");
  }

  const myFriendIds = await db.userFriends
    .findMany({
      where: { userId: session.user.id },
      select: { friendId: true },
    })
    .then((rows) => rows.map((r) => r.friendId));

  const users = await db.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains, mode: "insensitive" } },
            { username: { contains, mode: "insensitive" } },
            { email: { contains, mode: "insensitive" } },
          ],
        },
        { id: { not: session.user.id } },
        {
          NOT: [
            {
              sentRequests: {
                some: {
                  OR: [
                    { status: FriendshipStatus.FRIENDS },
                    { status: FriendshipStatus.BLOCKED },
                  ],
                },
              },
            },
            {
              receivedRequests: {
                some: {
                  OR: [
                    { status: FriendshipStatus.FRIENDS },
                    { status: FriendshipStatus.BLOCKED },
                  ],
                },
              },
            },
            {
              friends: {
                some: {
                  OR: [{ friendId: session.user.id }],
                },
              },
            },
            {
              friendOf: {
                some: {
                  OR: [{ userId: session.user.id }],
                },
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatarUrl: true,
      friends: {
        where: { friendId: session.user.id },
        select: { id: true },
      },
      friendOf: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      sentRequests: {
        where: {
          status: FriendshipStatus.PENDING,
        },
        select: { id: true },
      },
      receivedRequests: {
        where: {
          status: FriendshipStatus.PENDING,
        },
        select: { id: true },
      },
    },
    orderBy: [
      {
        friends: {
          _count: "desc",
        },
      },
      {
        friendOf: {
          _count: "desc",
        },
      },
      { name: "asc" },
    ],
  });

  const results: SearchUserType[] = [];

  for (const user of users) {
    const mutualCount = await db.userFriends.count({
      where: {
        userId: user.id,
        friendId: { in: myFriendIds },
      },
    });

    const isFriend = user.friends.length > 0 || user.friendOf.length > 0;

    const hasSentRequest = user.receivedRequests.length > 0;
    const hasIncomingRequest = user.sentRequests.length > 0;

    results.push({
      id: user.id,
      name: user.name ?? undefined,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl ?? undefined,
      isFriend,
      mutualFriendsCount: mutualCount,
      hasSentRequest,
      hasIncomingRequest,
    });
  }
  return results;
};

/**
 * Send a friend request with limitations on the number of recent requests.
 */
export const sendFriendRequest = async (receiverId: string) => {
  const session = await auth();
  if (!session?.user.id) {
    throw new Error("Unauthorized");
  }
  const senderId = session.user.id;
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
      throw new Error("You've sent too many friend requests recently.");
    }

    const existingRequest = await db.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
      },
    });
    if (existingRequest) {
      if (existingRequest.status === FriendshipStatus.BLOCKED) {
        throw new Error("Cannot send friend request.");
      }
      throw new Error("Friend request already exists.");
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
      throw new Error("Users are already friends.");
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
      error instanceof Error ? error.message : "Error sending friend request.";
    console.error("Error in sendFriendRequest:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Retrieve pending friend requests sent by a specific user.
 */
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
        : "Error retrieving pending requests.";
    console.error("Error in getPendingRequests:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Handle a friend request by updating the request status and performing follow-up actions.
 *
 * Note: The 'status' parameter has been removed as it was redundant.
 */

export const handleFriendRequest = async (
  senderId: string,
  action: FriendshipStatus,
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const receiverId = session.user.id;

  if (!senderId || !action) {
    throw new Error("Missing required parameters");
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const existingRequest = await tx.friendRequest.findFirst({
        where: {
          senderId,
          receiverId,
          status: FriendshipStatus.PENDING,
        },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          status: true,
        },
      });
      if (!existingRequest) {
        throw new Error("Friend request not found or already handled");
      }

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

      await tx.friendRequest.update({
        where: { id: existingRequest.id },
        data: { status: action },
      });

      if (action === FriendshipStatus.FRIENDS) {
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

        await tx.friendRequest.deleteMany({
          where: {
            OR: [
              {
                senderId: existingRequest.senderId,
                receiverId: existingRequest.receiverId,
              },
              {
                senderId: existingRequest.receiverId,
                receiverId: existingRequest.senderId,
              },
            ],
          },
        });

        // 5c. Log NEWFRIEND activities for both parties
        const now = new Date();
        await tx.activity.createMany({
          data: [
            {
              userId: existingRequest.receiverId,
              type: ActivityType.NEWFRIEND,
              content: `You accepted a friend request from ${sender.name || sender.username}.`,
              createdAt: now,
              updatedAt: now,
            },
            {
              userId: existingRequest.senderId,
              type: ActivityType.NEWFRIEND,
              content: `${receiver.name || receiver.username} accepted your friend request.`,
              createdAt: now,
              updatedAt: now,
            },
          ],
        });

        // 5d. Remove any “friend request” recommendations between these users
        await tx.recommendations.deleteMany({
          where: {
            type: RecommendationType.FRIENDREQUEST,
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
          },
        });
      } else if (action === FriendshipStatus.REJECTED) {
        // Log a FRIENDREQUEST activity indicating rejection
        await Promise.all([
          tx.activity.create({
            data: {
              userId: existingRequest.senderId,
              type: ActivityType.FRIENDREQUEST,
              content: `${receiver.name || receiver.username} rejected your friend request.`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }),
          tx.friendRequest.updateMany({
            where: {
              senderId,
              receiverId,
            },
            data: {
              status: FriendshipStatus.REJECTED,
            },
          }),
        ]);
      } else if (action === FriendshipStatus.BLOCKED) {
        // 5e. Delete any existing UserFriends entries in both directions
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

        // 5f. Log a BLOCKED activity for the sender
        await tx.activity.create({
          data: {
            userId: existingRequest.senderId,
            type: ActivityType.BLOCKED,
            content: `${receiver.name || receiver.username} blocked you.`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Step 6: Return a concise summary
      return {
        success: true as const,
        actionTaken: action,
        sender: {
          id: existingRequest.senderId,
          name: sender.name || sender.username,
        },
        receiver: {
          id: existingRequest.receiverId,
          name: receiver.name || receiver.username,
        },
      };
    });

    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error handling friend request";
    console.error("Error in handleFriendRequest:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Remove friendship between two users using a transaction.
 */
/**
 * Remove friendship between two users using a transaction.
 */
export const removeFriend = async (userId: string, friendId: string) => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Make sure a friendship actually exists.
      const friendship = await tx.userFriends.findFirst({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (!friendship) {
        return { success: false, message: "Friendship not found." };
      }

      // 2. Delete both directions of the userFriends entries.
      await tx.userFriends.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      // 3. Also delete any pending (or old) friendRequest records between these two.
      await tx.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
        },
      });

      // 4. Fetch user info to log a removal activity.
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
        throw new Error("User or friend not found.");
      }

      // 5. Log an activity saying “You removed X from your friends.”
      await tx.activity.create({
        data: {
          userId,
          type: ActivityType.FRIENDREQUEST,
          content: `You removed ${friend.name || friend.username} from your friends.`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return { success: true, message: "Friend removed successfully." };
    });

    return result;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error removing friend.";
    console.error("Error in removeFriend:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Block a user by updating (or creating) a friend request record and deleting any existing friendship.
 */
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

      // Remove any existing friendship between the users.
      await tx.userFriends.deleteMany({
        where: {
          OR: [
            { userId, friendId: blockedUserId },
            { userId: blockedUserId, friendId: userId },
          ],
        },
      });
    });

    return { success: true, message: "User blocked successfully." };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error blocking user.";
    console.error("Error in blockUser:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Create an activity record for friend-related actions.
 */
export const createFriendActivity = async (
  userId: string,
  activityType: ActivityType,
  content: string,
) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true, avatarUrl: true },
    });

    if (!user) throw new Error("User not found.");

    await db.activity.create({
      data: {
        userId,
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

/**
 * Update recommendations after a friend action.
 */
export const updateRecommendationsAfterFriendAction = async (
  userId: string,
  friendId: string,
  action: FriendshipStatus,
) => {
  try {
    if (
      action === FriendshipStatus.FRIENDS ||
      action === FriendshipStatus.BLOCKED
    ) {
      await db.recommendations.deleteMany({
        where: {
          OR: [
            { userId, recommendedUserId: friendId },
            { userId: friendId, recommendedUserId: userId },
          ],
          type: RecommendationType.FRIENDREQUEST,
        },
      });
    } else if (action === FriendshipStatus.REJECTED) {
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

/**
 * Update the user's last login timestamp.
 */
export const updateUserLastLogin = async (userId: string) => {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating user connection status:", error);
  }
};

/**
 * Retrieve the friendship status between two users.
 */
export const getFriendshipStatus = async (
  userId: string,
  otherUserId: string,
) => {
  try {
    const areFriends = await db.userFriends.findFirst({
      where: { userId, friendId: otherUserId },
    });

    if (areFriends) return FriendshipStatus.FRIENDS;

    const pendingRequest = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    if (pendingRequest) return pendingRequest.status;

    return FriendshipStatus.NONE;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Error retrieving friendship status.";
    console.error("Error in getFriendshipStatus:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const createGroup = async ({
  participants,
  name,
  description = "",
  avatarUrl = "",
  token,
}: {
  name: string;
  participants: ParticipantsType[];
  description?: string;
  avatarUrl?: string;
  token: string;
}) => {
  try {
    const response = await db.$transaction(async (tx) => {
      const response = await createAGroupChat({
        participants,
        name,
        token,
      });

      const existingGroup = await tx.group.findUnique({
        where: { backendId: response._id },
      });

      if (existingGroup) {
        throw new Error("Group with this backendId already exists.");
      }

      const newGroup = await tx.group.create({
        data: {
          name,
          backendId: response._id,
          description,
          avatarUrl,
          creatorId: response.admin,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: response.admin,
          role: GroupMemberRole.ADMIN,
        },
      });

      for (const p of participants) {
        await tx.groupMember.create({
          data: {
            groupId: newGroup.id,
            userId: p.userId,
            role: GroupMemberRole.MEMBER,
          },
        });
      }

      await tx.activity.create({
        data: {
          userId: response.admin,
          type: ActivityType.GROUPCREATED,
          content: `Group "${name}" created successfully.`,
        },
      });

      return response;
    });
    return response;
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
};

export const deleteGroup = async ({
  chatId,
  token,
}: {
  chatId: string;
  token: string;
}) => {
  try {
    const response = await db.$transaction(async (tx) => {
      const group = await tx.group.findUnique({
        where: { backendId: chatId },
      });

      if (!group) throw new Error("Group not found.");

      await deleteGroupChat({
        chatId: group.backendId,
        token,
      });

      await tx.group.delete({
        where: { backendId: chatId },
      });

      await tx.activity.create({
        data: {
          userId: group.creatorId,
          type: ActivityType.GROUPDELETED,
          content: `Group "${group.name}" deleted successfully.`,
        },
      });
      return null;
    });
    return response;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group");
  }
};
