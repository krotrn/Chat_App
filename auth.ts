import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas/signinSchema";
import { ApiError } from "@/lib/api/ApiError";
import { connectToDatabase } from "./lib/mongoose";
import { User } from "@/models/auth/user.models";
import { UserLoginType } from "@/utils/constants";
import { UserType } from "@/types/User.type";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        username: {
          label: "Username",
          type: "text",
          placeholder: "Username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        try {
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
              statusCode: 404,
              message: "User does not exist",
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
            avatar: user.avatar,
            username: user.username,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            refreshToken: user.generateRefreshToken(),
            accessToken: user.generateAccessToken(),
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
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/sign-out",
    error: '/auth/error'
  },
  callbacks: {
    async signIn({ user }) {
      const existingUser = await User.findOne({ _id: user._id });
      if (
        !existingUser ||
        (!existingUser.isEmailVerified &&
          existingUser.loginType === UserLoginType.EMAIL_PASSWORD)
      ) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.avatar = user.avatar;
        token.username = user.username;
        token.email = user.email ?? "";
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        token.refreshToken = user.refreshToken;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string;
        session.user.avatar = token.avatar as {
          url: string;
          localPath: string;
        };
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        session.user.refreshToken = token.refreshToken as string;
        session.user.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  events: {
    async linkAccount({ user }) {
      await User.findByIdAndUpdate(
        { _id: user._id },
        { isEmailVerified: true }
      );
    },
  },
});
