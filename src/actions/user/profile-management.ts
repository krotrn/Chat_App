"use server";

import { auth } from "@/auth";
import { handleError, handleSuccess } from "@/lib/helper";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { updateUserWebhook } from "@/services/webhook/user";
import { StatsProps } from "@/types/formattedDataTypes";
import { UserRoles } from "@prisma/client";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "../shared/cloudinary";
import { handleActionError } from "../../lib/utils/utils";

interface ResponseType<T> {
  success: boolean;
  error: boolean;
  data?: T;
  message: string;
}

export const updateProfile = async (
  data: z.infer<typeof profileSchema>,
): Promise<
  ResponseType<{
    id: string;
    name: string | null;
    username: string;
    bio: string | null;
    role: UserRoles;
    avatarUrl: string | null;
    status: string | null;
    email: string;
  }>
> => {
  const session = await auth();
  if (!session || !session.user.id)
    return handleError("User not authenticated.");

  try {
    const { name, bio, avatar, status, username } = data;
    const avatarUrl = avatar
      ? await uploadAvatar(avatar, username)
      : session.user.avatarUrl;

    const user = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: { name, bio, avatarUrl, status },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          bio: true,
          avatarUrl: true,
          status: true,
          email: true,
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
        name: user.name,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        status: user.status,
        role: user.role,
        email: user.email,
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

export async function uploadAvatar(
  avatar: File,
  username: string,
): Promise<string> {
  try {
    const result = await uploadToCloudinary(avatar, {
      folder: "avatars",
      publicId: `${username}_avatar_${Date.now()}`,
      transformation: [
        { width: 300, height: 300, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    const errorMessage = handleActionError(error, "Failed to upload avatar");
    console.error("Error uploading avatar:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function deleteFileFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
): Promise<{ success: boolean; message: string }> {
  try {
    return await deleteFromCloudinary(publicId, resourceType);
  } catch (error) {
    const errorMessage = handleActionError(
      error,
      "Failed to delete file from Cloudinary",
    );
    console.error("Error deleting file from Cloudinary:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

export const getUserDataByUsername = async (username: string) => {
  try {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
    });

    if (!user) {
      console.warn(`User with username ${username} not found.`);
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user data by username:", errorMsg);
    throw new Error(errorMsg);
  }
};

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
