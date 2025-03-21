"use server";
import { auth } from "@/auth";
import { db } from "@/prisma";
import { profileSchema } from "@/schemas/profileSchema";
import { z } from "zod";

export default async function updateProfile(
  data: z.infer<typeof profileSchema>
) {
  const { name, avatar, bio } = data;
  const session = await auth();

  if (!session) {
    return { success: false, error: true, message: "User not found." };
  }

  try {
    // TODO
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        // avatarUrl: // Update after implementing file upload
        bio,
      },
    });

    return {
      success: true,
      error: false,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: true,
      message: "An error occurred while updating the profile.",
    };
  }
}
