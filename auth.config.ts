import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ApiError } from "./lib/api/ApiError";
import { UserType } from "./types/User.type";
import { UserLoginType, UserRolesEnum } from "./utils/constants";
export default {
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          username: profile.user,
          _id: profile._id,
          email: profile.email,
          isEmailVerified: true,
          role: UserRolesEnum.USER,
          id:profile.id
        }
      }
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (typeof window !== "undefined") return null;

          if (process.env.NEXT_RUNTIME !== "nodejs") return null;

          const { signInSchema } = await import("./schemas/signinSchema");
          const { connectToDatabase } = await import("./lib/mongoose");
          const User = (await import("@/models/auth/user.models")).default;
          const parsed = signInSchema.safeParse(credentials);
          if (!parsed.success) {
            throw new ApiError({
              statusCode: 400,
              message: parsed.error.errors.map((e) => e.message).join(", "),
            });
          }
          await connectToDatabase();

          const { email, username, password } = parsed.data;
          const user: UserType | null = await User.findOne({
            $or: [{ email }, { username }],
          });

          if (!user) {
            throw new ApiError({
              statusCode: 401,
              message: "Invalid email or password",
            });
          }

          if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
            throw new ApiError({
              statusCode: 400,
              message: `You registered with ${user.loginType.toLowerCase()}. Please use that login method.`,
            });
          }

          if (!(await user.isPasswordMatch(password))) {
            throw new ApiError({
              statusCode: 401,
              message: "Invalid credentials",
            });
          }

          return {
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          };
        } catch (error) {
          throw new ApiError({
            statusCode: 500,
            message: (error as Error).message,
          });
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  events: {
    async linkAccount({ user }) {
      if (process.env.NEXT_RUNTIME !== "nodejs") return;

      const { default: User } = await import("@/models/auth/user.models");
      const { connectToDatabase } = await import("./lib/mongoose");

      await connectToDatabase();
      await User.findByIdAndUpdate(
        { _id: user._id },
        { isEmailVerified: true }
      );
    },
  },
  pages: {
    signIn: '/login',
    error: '/error'
  }
} satisfies NextAuthConfig;