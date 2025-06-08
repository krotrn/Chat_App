"use server";

import { db } from "@/prisma";
import { createAGroupChat, deleteGroupChat } from "@/services/chat";
import { ParticipantsType } from "@/types";
import { ActivityType, GroupMemberRole } from "@prisma/client";

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
