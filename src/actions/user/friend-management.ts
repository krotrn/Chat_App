"use server";

import { auth } from "@/auth";
import { db } from "@/prisma";
import {
  FriendRequestType,
  FormattedFriendType,
  SearchUserType,
} from "@/types/formattedDataTypes";
import {
  ActivityType,
  FriendshipStatus,
  RecommendationType,
} from "@prisma/client";

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
        return { success: false, message: "Friendship not found." };
      }

      await tx.userFriends.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      await tx.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
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
        throw new Error("User or friend not found.");
      }

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

    return { success: true, message: "User blocked successfully." };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Error blocking user.";
    console.error("Error in blockUser:", errorMsg);
    throw new Error(errorMsg);
  }
};

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
