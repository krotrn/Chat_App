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

interface ResponseType {
  success: boolean;
  error: boolean;
  data?: unknown;
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
  if (!session) throw new Error("Unauthenticated");

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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Updates the user's profile with the provided data.
 *
 * This function first verifies the user session and then updates the
 * profile's name, bio, and avatar URL in the database. If an avatar is provided,
 * it is uploaded and its URL is stored. If the operation is successful, a success
 * response is returned; otherwise, an error response is returned.
 *
 * @param data - The profile data to update, which should conform to the profileSchema.
 *               This includes the user's name, bio, and optionally an avatar.
 * @returns A Promise that resolves with a ResponseType indicating whether the update
 *          was successful or detailing any errors encountered.
 */
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

/**
 * Uploads an avatar image file.
 *
 * This function uploads the supplied avatar file and returns a URL pointing to the uploaded image.
 * Currently, the implementation is a placeholder that returns a fixed URL.
 *
 * @param avatar - The image file to be uploaded.
 * @returns A promise that resolves to the URL string of the uploaded avatar.
 */
async function uploadAvatar(avatar: File): Promise<string> {
  // TODO
  void avatar;
  return "https://example.com/avatar.jpg";
}

/**
 * Retrieves friend requests for the authenticated user, selecting only the specified fields.
 *
 * @template T - A key of the FriendRequest interface that represents a valid field to select.
 * @param {T[]} selectFields - An array of keys from FriendRequest. Only these fields will be included in the result.
 * @returns {Promise<FriendRequest[]>} A promise that resolves to an array of friend requests, each represented as an object with only the selected fields.
 * @throws {Error} If the user is not authenticated or if an error occurs during the database query.
 */
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
      where: { receiverId: session.user.id, status: "PENDING" },
      select,
    });

    return friendRequests;
  } catch {
    throw new Error("Error Getting Request.");
  }
};

/**
 * Retrieves user data by its unique identifier with the specified field selection.
 *
 * @template T - A type representing the selection object where each key (from the User model) is a boolean
 * indicating whether that field should be included in the retrieved user object.
 * @param {string} id - The unique identifier of the user.
 * @param {T} select - An object specifying which fields to include in the result.
 * @returns A promise that resolves with the user data if found.
 *
 * @throws {Error} If the user with the specified id is not found or if any error occurs during the database operation.
 */
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
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
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    throw error;
  }
};
