import bcrypt from "bcryptjs";
import { db } from "@/prisma";
import { ApiError } from "@/lib/api/ApiError";

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

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { emailVerificationToken: true },
    });
    if (!user)
      throw new ApiError({
        statusCode: 404,
        message: "user not found for verification",
      });
    return user.emailVerificationToken;
  } catch {
    throw new ApiError({
      statusCode: 500,
      message: "error in getting verification token",
    });
  }
};

export const generateOTP = (num: number) => {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .slice(0, num);
};
