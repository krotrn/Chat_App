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

  const exists = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!exists) return username;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${username.slice(0, 10)}_${suffix}`;
};
