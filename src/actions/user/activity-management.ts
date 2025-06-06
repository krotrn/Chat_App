"use server";

import { auth } from "@/auth";
import { db } from "@/prisma";
import {
  ActivityType,
  FriendshipStatus,
  RecommendationType,
} from "@prisma/client";

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
