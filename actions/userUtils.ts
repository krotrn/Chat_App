"use server";

import { auth } from "@/auth";
import { handleError, handleSuccess } from "@/lib/helper";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { User } from "@prisma/client";
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
    console.log("Error fetching recommendations:", error);
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
    console.log("Error fetching activities:", error);
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
    const select: Record<string, boolean> = {
      ...fields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>),
      friends: true,
    };

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select,
    });

    if (!user) return handleError("User not found.");
    return handleSuccess(user, "Successfully fetched user stats.");
  } catch (error) {
    console.log("Error fetching user stats:", error);
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
    console.log("Error updating profile:", error);
    return handleError("An error occurred while updating the profile.");
  }
};

async function uploadAvatar(avatar: File): Promise<string> {
  void avatar;
  // TODO: Implement upload logic
  return "https://example.com/avatar.jpg";
}

export const getFriendRequests = async (): Promise<ResponseType> => {
  const session = await auth();
  if (!session || !session.user.id) return handleError("Unauthorized Access");

  try {
    const friendRequests = await db.friendRequest.findMany({
      where: { receiverId: session.user.id, status: "PENDING" },
      select: {
        id: true,
        sender: { select: { id: true, username: true, avatarUrl: true } },
        createdAt: true,
      },
    });

    return handleSuccess(
      friendRequests,
      "Successfully fetched friend requests."
    );
  } catch (error) {
    console.log("Error fetching friend requests:", error);
    return handleError("An error occurred while fetching friend requests.");
  }
};

export const getUserDataById = async (
  id: string,
  reqData: (keyof User)[]
): Promise<Partial<User> | null> => {
  try {
    const select = reqData.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

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
    console.log("Error fetching user data:", error);
    return null;
  }
};
