"use server";

import { signOut } from "@/auth";

export const signout = async () => {
  await signOut({ redirectTo: "/login" });
};
