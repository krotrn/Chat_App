"use server";

import { auth, unstable_update } from "@/auth";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { User } from "@prisma/client";
import { z } from "zod";

export const getRecommendations = async () => {
  const session = await auth();
  if (!session)
    return {
      error: true,
      success: false,
      message: "Unautherized Access",
      data: [],
    };

  try {
    const response = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        recommendations: true,
      },
    });
    if (!response)
      return {
        error: true,
        success: false,
        message: "Error getting Response",
        data: [],
      };
    return {
      success: true,
      error: false,
      data: response.recommendations,
      message: "successfull getting Data.",
    };
  } catch (error) {
    console.log("Error on Recommendations:", (error as Error).message);
    return {
      success: false,
      error: true,
      message: "An error occurred while getting Recommendations.",
      data: [],
    };
  }
};
export const getActivities = async () => {
  const session = await auth();
  if (!session)
    return {
      error: true,
      success: false,
      message: "Unautherized Access",
      data: [],
    };

  try {
    const response = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        recentActivities: true,
      },
    });
    if (!response)
      return {
        error: true,
        success: false,
        message: "Error getting Response",
        data: [],
      };
    return {
      success: true,
      error: false,
      data: response.recentActivities,
      message: "successfull getting Data.",
    };
  } catch (error) {
    console.log("Error on Activity:", (error as Error).message);
    return {
      success: false,
      error: true,
      message: "An error occurred while getting Activity.",
      data: [],
    };
  }
};

export const getUserStats = async () => {
  const session = await auth();
  if (!session)
    return {
      error: true,
      success: false,
      message: "Unautherized Access",
    };

  try {
    const response = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        email: true,
        avatarUrl: true,
        name: true,
        bio: true,
        lastLogin: true,
        friends: true,
        sentRequests: true,
        receivedRequests: true,
      },
    });
    if (!response)
      return {
        error: true,
        success: false,
        message: "Error getting Response",
      };
    return {
      success: true,
      error: false,
      data: response,
      message: "successfull getting Data.",
    };
  } catch (error) {
    console.log("Error on User Stats:", (error as Error).message);
    return {
      success: false,
      error: true,
      message: "An error occurred while getting User Stats.",
    };
  }
};

export const updateProfile = async (data: z.infer<typeof profileSchema>) => {
  const { name, avatar, bio } = data;
  void avatar;

  const session = await auth();
  if (!session || !session.user.id) {
    return { success: false, error: true, message: "User not authenticated." };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        // avatarUrl: // TODO: Upload Image and add its link
      },
    });

    const updatedUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!updatedUser) {
      throw new Error("Failed to retrieve updated user data.");
    }
    await unstable_update({
      user: {
        ...updatedUser,
        bio: updatedUser.bio ?? undefined,
      },
    });

    return {
      success: true,
      error: false,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.log("Error updating profile:", (error as Error).message);
    return {
      success: false,
      error: true,
      message: "An error occurred while updating the profile.",
    };
  }
};


export const getFriendRequests = async () => {
  const session = await auth();
  if (!session || !session.user?.id) {
    return {
      error: true,
      success: false,
      message: "Unauthorized Access",
    };
  }

  try {
    const response = await db.user.findUnique({
      where: { id: session.user.id },
      select: { receivedRequests: true },
    });

    if (!response) {
      return {
        error: true,
        success: false,
        message: "Error getting response",
      };
    }

    return { error: false, success: true, data: response.receivedRequests };
  } catch (error) {
    console.log("Error getting friend requests:", (error as Error).message);
    return {
      error: true,
      success: false,
      message: "An error occurred while getting friend requests.",
    };
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
      console.log(`User with ID ${id} not found.`);
      return null;
    }
    return user;
  } catch (error) {
    console.log(`Error fetching user data: ${String(error)}`);
    return null;
  }
};
