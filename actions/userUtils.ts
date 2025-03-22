"use server";

import { auth } from "@/auth";
import { handleError, handleSuccess } from "@/lib/helper";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { FriendRequest, User } from "@prisma/client";
import { z } from "zod";

interface ResponseType {
  success: boolean;
  error: boolean;
  data?: unknown;
  message: string;
}

export const getRecommendations = async (): Promise<ResponseType> => {
  const session = await auth();
  if (!session) return handleError("Unauthorized Access");

  try {
    const recommendations = await db.recommendations.findMany({
      where: { userId: session.user.id },
    });
    return handleSuccess(
      recommendations,
      "Successfully fetched recommendations."
    );
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return handleError("An error occurred while fetching recommendations.");
  }
};

export const getActivities = async (): Promise<ResponseType> => {
  const session = await auth();
  if (!session) return handleError("Unauthorized Access");

  try {
    const activities = await db.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return handleSuccess(activities, "Successfully fetched activities.");
  } catch (error) {
    console.error("Error fetching activities:", error);
    return handleError("An error occurred while fetching activities.");
  }
};

export const getUserStats = async (
  fields: (keyof User)[] = [
    "username",
    "email",
    "avatarUrl",
    "name",
    "bio",
    "lastLogin",
  ]
): Promise<ResponseType> => {
  const session = await auth();
  if (!session) return handleError("Unauthorized Access");

  try {
    const select: Partial<Record<keyof User, boolean>> = fields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Partial<Record<keyof User, boolean>>
    );

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        friends: true,
        ...select,
      },
    });

    if (!user) return handleError("User not found.");
    return handleSuccess(user, "Successfully fetched user stats.");
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return handleError("An error occurred while fetching user stats.");
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
  } catch (error) {
    console.error("Error updating profile:", error);
    return handleError("An error occurred while updating the profile.");
  }
};

async function uploadAvatar(avatar: File): Promise<string> {
  // TODO
  void avatar
  return "https://example.com/avatar.jpg";
}

export const getFriendRequests = async <T extends keyof FriendRequest>(
  selectFields: T[]
) => {
  const session = await auth();
  if (!session || !session.user.id) return null;

  try {
    const select = selectFields.reduce(
      (acc, field) => {
        acc[field] = true;
        return acc;
      },
      {} as Partial<Record<keyof FriendRequest, boolean>>
    );

    const friendRequests = await db.friendRequest.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      select,
    });

    return friendRequests;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
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
        acc[key] = true;
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
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};
