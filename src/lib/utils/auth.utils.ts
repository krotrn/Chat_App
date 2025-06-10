import { db } from "@/prisma";
import bcrypt from "bcryptjs";
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};
export const generateUniqueUsername = async (base: string) => {
  const username = base
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15);

  let finalUsername = username;
  const MAX_ATTEMPTS = 1000;
  let suffix = 1;

  while (suffix < MAX_ATTEMPTS) {
    const existing = await db.user.findUnique({
      where: { username: finalUsername },
      select: { id: true },
    });
    if (!existing) break;
    finalUsername = `${username.slice(0, 10)}_${suffix}`;
    suffix++;
  }

  if (suffix >= MAX_ATTEMPTS) {
    throw new Error("Could not generate a unique username. Please try again.");
  }

  return finalUsername;
};
