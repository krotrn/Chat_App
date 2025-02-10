// auth.utils.ts
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { db } from "@/prisma";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateUniqueUsername = async (base: string) => {
  const username = base
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15);

  const exists = await db.user.findUnique({ 
    where: { username },
    select: { id: true }
  });

  if (!exists) return username;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${username.slice(0, 10)}_${suffix}`;
};


export const generateAccessToken = (user: {
  id: string;
  email: string;
  username: string;
  role: string;
}) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" } as SignOptions
  );
};

export const generateRefreshToken = (userId: string) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  }as SignOptions);
};

export const generateTempToken = async () => {
  if (!process.env.TEMP_TOKEN_SECRET) {
    throw new Error("TEMP_TOKEN_SECRET is not defined");
  }

  const array = new Uint8Array(20);
  globalThis.crypto.getRandomValues(array);
  const unHashedToken = Buffer.from(array).toString("hex");

  const encoder = new TextEncoder();
  const data = encoder.encode(unHashedToken);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashedToken = Buffer.from(hashBuffer).toString("hex");

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry: new Date(Date.now() +  20 * 60 * 1000),
  };
};