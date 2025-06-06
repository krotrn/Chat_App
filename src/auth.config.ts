import GitHub, { GitHubProfile } from "next-auth/providers/github";
import Google, { GoogleProfile } from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas/signinSchema";
import { db } from "@/prisma";
import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/api/ApiError";
import { AccountType, UserRoles } from "@prisma/client";
import { generateUniqueUsername } from "@/lib/utils/auth.utils";
import jwt from "jsonwebtoken";

export default {
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      if (!user) return false;
      if (user) {
        return true;
      }

      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            email: user.email,
            username: user.username,
            role: user.role,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "30d" } as jwt.SignOptions,
        );

        return {
          ...token,
          accessToken,
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          email: user.email,
          username: user.username,
          role: user.role,
          bio: user.bio,
          exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
        };
      }
      if (Date.now() < (token.exp as number) * 1000) {
        return token;
      }
      return {
        ...token,
        exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
      };
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          avatarUrl: (token.avatarUrl as string) || null,
          email: token.email as string,
          username: token.username as string,
          role: token.role as UserRoles,
          bio: token.bio as string,
        };
        session.accessToken = token.accessToken as string;
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
          name: profile.name || profile.login,
          avatarUrl: profile.avatar_url,
          username: profile.login,
          role: UserRoles.USER,
          loginType: AccountType.GITHUB,
          emailVerified: profile.email ? new Date() : null,
          bio: profile.bio || undefined,
          email: profile.email,
          image: profile.avatar_url,
          status: profile.bio || "",
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
          bio: profile.bio || undefined,
          status: profile.bio || "",
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
          console.log(identifier, password);

          const user = await db.user.findFirst({
            where: {
              OR: [{ email: identifier }, { username: identifier }],
            },
          });
          console.log("User found in authorize function:", user);

          if (!user || !user.password) return null;

          const passwordValid = await bcrypt.compare(password, user.password);
          if (!passwordValid) return null;

          return {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            bio: user.bio ?? undefined,
            status: user.status ?? "",
          };
        } catch (error) {
          console.error("Error in credentials authorization:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
    newUser: "/register",
  },
  events: {
    async linkAccount({ user }) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
          },
        });
      } catch (error) {
        console.error("Error linking account:", error);
      }
    },
  },
} satisfies NextAuthConfig;
