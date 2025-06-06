"use server";

import { signOut } from "@/auth";

export const signout = async (redirectTo: string = "/login"): Promise<void> => {
  try {
    await signOut({ redirectTo });
  } catch (error) {
    console.error("Sign out error:", error);
  }
};
