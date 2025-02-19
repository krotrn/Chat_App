import GitHub, { GitHubProfile } from "next-auth/providers/github";
import Google, { GoogleProfile } from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./schemas/signinSchema";
import { db } from "./prisma";
import bcrypt from "bcryptjs";
import { ApiError } from "./lib/api/ApiError";
import { AccountType, UserRoles } from "@prisma/client";
import { generateUniqueUsername } from "./utils/auth.utils";

export default {
  callbacks: {
    async signIn({ user: { id }, account }) {
      if (account?.provider !== "credentials") return true;
      if (!id) return false;
      const existingUser = await db.user.findUnique({ where: { id }, select: {email:true, emailVerified: true } });
      if (!existingUser) {
        return false
      }
      const { email, emailVerified } = existingUser;
      if (emailVerified) {
        return true;
      }
      await fetch("/api/v1/auth/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((data) => data.json())
        .then((result) => {
          if (!result.success) {
            return false;
          }
        });
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.avatarUrl = user.avatarUrl;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          name: token.name,
          avatarUrl: (token.avatarUrl as string) || null,
          id: token.id as string,
          email: token.email as string,
          username: token.username as string,
          role: token.role as UserRoles,
        };
      }
      return session;
    },
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile: async (profile: GitHubProfile) => {
        return {
          id: profile.id.toString(),
          avatarUrl: profile.avatar_url,
          name: profile.name,
          username: await generateUniqueUsername(profile.login),
          email: profile.email,
          emailVerified: new Date(),
          role: UserRoles.USER,
          loginType: AccountType.GITHUB,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile: async (profile: GoogleProfile) => {
        return {
          id: profile.sub,
          avatarUrl: profile.picture,
          name: profile.name,
          username: await generateUniqueUsername(profile.name),
          email: profile.email,
          emailVerified: profile.email_verified || null,
          role: UserRoles.USER,
          loginType: AccountType.GOOGLE,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const parsed = signInSchema.safeParse(credentials);
          if (!parsed.success) {
            throw new ApiError({
              statusCode: 400,
              message: "Invalid credentials format",
            });
          }

          const { identifier, password } = parsed.data;

          const user = await db.user.findFirst({
            where: {
              OR: [{ email: identifier }, { username: identifier }],
              loginType: AccountType.EMAIL,
            },
          });

          if (!user?.password) return null;

          const passwordValid = await bcrypt.compare(password, user.password);
          if (!passwordValid) return null;

          if (!user.emailVerified && user.loginType !== AccountType.EMAIL) {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl || null,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.log(error)
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
} satisfies NextAuthConfig;
