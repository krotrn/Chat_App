"use server";

import { auth } from "@/auth";
import { handleError, handleSuccess } from "@/lib/helper";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { FormattedFriend, StatsProps } from "@/types/formattedDataTypes";
import { FriendRequest, User } from "@prisma/client";
import { z } from "zod";

interface ResponseType {
  success: boolean;
  error: boolean;
  data?: unknown;
  message: string;
}

export const getRecommendations = async () => {
  const session = await auth();
  if (!session) return null;

  try {
    const recommendations = await db.recommendations.findMany({
      where: { userId: session.user.id },
    });
    return recommendations;
  } catch  {
    return null;
  }
};

export const getActivities = async () => {
  const session = await auth();
  if (!session) return null;

  try {
    const activities = await db.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return activities;
  } catch {
    return null;
  }
};

export const getUserStats = async <T extends keyof StatsProps>(
  fields: T[]
) => {
  const session = await auth();
  if (!session) return null;

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
    if (!user) return null;
    return user;
  } catch {
    return null;
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
  } catch  {
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
  if (!session || !session.user.id) return null;

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
    return null;
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
  } catch  {
    return null;
  }
};

export const getUserFriends = async (
  id: string
): Promise<FormattedFriend[] | null> => {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { friends: { select: { id: true } } },
    });
    if (!user || !user.friends) return null;
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
          avatarUrl: friend.avatarUrl === null ? undefined : friend.avatarUrl,
          name: friend.name === null ? undefined : friend.name,
          username: friend.username,
          bio: friend.bio === null ? undefined : friend.bio,
          isOnline: friend.isOnline,
        } 
      })
    );

    return friends.filter((f) => f !== null);
  } catch  {
    return null;
  }
};
