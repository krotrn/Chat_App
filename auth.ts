/**
 * Initializes and configures NextAuth for authentication.
 *
 * @module auth
 * @fileoverview This module sets up NextAuth with Prisma adapter for authentication.
 * 
 * @requires next-auth
 * @requires @auth/prisma-adapter
 * @requires next-auth/adapters
 * @requires @/auth.config
 * @requires @/prisma
 * 
 * @constant {Object} handlers - The NextAuth handlers.
 * @constant {Function} auth - The NextAuth authentication function.
 * @constant {Function} signIn - The NextAuth sign-in function.
 * @constant {Function} signOut - The NextAuth sign-out function.
 * 
 * @typedef {Object} NextAuthOptions
 * @property {Object} adapter - The Prisma adapter for NextAuth.
 * @property {Object} session - The session configuration.
 * @property {string} session.strategy - The session strategy, set to "jwt".
 * @property {number} session.maxAge - The maximum age of the session in seconds.
 * @property {string} secret - The secret used for signing tokens.
 */
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { db } from '@/prisma'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"; 


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
