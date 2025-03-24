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
import { FriendRequest, FriendshipStatus, User } from "@prisma/client";
import { z } from "zod";

interface ResponseType {
  success: boolean;
  error: boolean;
  data?: unknown;
  message: string;
}

export const getRecommendations = async () => {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  try {
    const recommendations = await db.recommendations.findMany({
      where: { userId: session.user.id },
    });
    return recommendations;
  } catch (error) {
    throw error;
  }
};

export const getActivities = async () => {
  const session = await auth();
  if (!session) throw new Error("Unauthotized");

  try {
    const activities = await db.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return activities;
  } catch (error) {
    throw error;
  }
};

export const getUserStats = async <T extends keyof StatsProps>(fields: T[]) => {
  const session = await auth();
  if (!session) throw new Error("Unauthotized");

  try {
    const select: Partial<Record<keyof StatsProps, boolean>> = fields.reduce(
      (acc, key) => {
        acc[key as keyof StatsProps] = true;
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
    throw error;
  }
};

export const updateProfile = async (
  data: z.infer<typeof profileSchema>
): Promise<ResponseType> => {
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
  } catch {
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
) => {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");

  try {
    const select = selectFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Partial<Record<keyof FriendRequest, boolean>>);

    const friendRequests = await db.friendRequest.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      select,
    });

    return friendRequests;
  } catch {
    throw new Error("Error Getting Request.");
  }
};

export const getUserDataById = async <T extends keyof User>(
  id: string,
  reqData: T[]
) => {
  try {
    const select: Partial<Record<keyof User, boolean>> = reqData.reduce(
      (acc, key) => {
        acc[key as keyof User] = true;
        return acc;
      },
      {} as Partial<Record<keyof User, boolean>>
    );

    const user = await db.user.findUnique({
      where: { id },
      select,
    });

    if (!user) {
      console.warn(`User with ID ${id} not found.`);
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

export const getUserFriends = async (
  id: string
): Promise<FormattedFriendType[]> => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { friends: { select: { id: true } } },
    });
    if (!user || !user.friends) throw new Error("something went wrong");
    const friends = await Promise.all(
      user.friends.map(async (f) => {
        const friend = await db.user.findUnique({
          where: { id: f.id },
          select: {
            avatarUrl: true,
            name: true,
            username: true,
            bio: true,
            isOnline: true,
          },
        });
        if (!friend) return null;
        return {
          id: f.id,
          avatarUrl: friend.avatarUrl ?? undefined,
          name: friend.name ?? undefined,
          username: friend.username,
          bio: friend.bio ?? undefined,
          isOnline: friend.isOnline,
        };
      })
    );

    return friends.filter((f) => f !== null);
  } catch (error) {
    throw error;
  }
};

export const getUserByQuery = async <T extends keyof SearchUserType>(
  contains: string,
  reqData: T[]
) => {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  try {
    const select = reqData.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Partial<Record<keyof SearchUserType, boolean>>);
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

    return users
      .filter((u) => u.id !== session.user.id)
      .map((u) => {
        return {
          ...u,
          name: u.name ?? undefined,
          avatarUrl: u.avatarUrl ?? undefined,
        };
      });
  } catch (error) {
    throw error;
  }
};

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  try {
    const existingRequest = await db.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
      },
    });
    if (existingRequest) {
      throw new Error("Friend request already sent");
    }

    const areFriends = await db.userFriends.findFirst({
      where: { userId: senderId, friendId: receiverId },
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
    throw error;
  }
};

export const getPendingRequests = async (senderId: string) => {
  try {
    const pendingRequests = await db.friendRequest.findMany({
      where: {
        senderId,
        status: "PENDING",
      },
      select: { id: true, receiverId: true },
    });

    return pendingRequests;
  } catch (error) {
    throw error;
  }
};

export const handleFriendRequest = async (
  senderId: string,
  receiverId: string,
  action: FriendshipStatus,
  status: FriendshipStatus
) => {
  try {
    await db.friendRequest.update({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
      data: {
        status: action === status ? "PENDING" : action,
      },
    });
  } catch (error) {
    throw error;
  }
};
