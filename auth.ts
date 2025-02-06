import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas/signinSchema";
import { ApiError } from "@/lib/api/ApiError";
import { connectToDatabase } from "./lib/mongoose";
import { User } from "@/models/auth/user.models";
import { UserLoginType } from "@/utils/constants";
import { UserType } from "@/types/User.type";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
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
          name: "email",
          placeholder: "user@example.com",
        },
        username: {
          label: "Username",
          name: "username",
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
          await connectToDatabase();
          const parsedSignInCredentials = signInSchema.safeParse(credentials);
          if (!parsedSignInCredentials.success) {
            throw new ApiError({
              statusCode: 402,
              message: parsedSignInCredentials.error.errors
                .map((e) => e.message)
                .join(", "),
            });
          }
          const { email, username, password } = parsedSignInCredentials.data;
          const user: UserType | null = await User.findOne({
            $or: [{ email }, { username }],
          }).lean();
          if (!user) {
            throw new Error("User does not exist");
          }
          if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
            throw new Error(
              `You registered with ${user.loginType.toLowerCase()}. Please use that login method.`
            );
          }

          const isPasswordValid = await user.isPasswordMatch(password);
          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            _id: user._id.toString(),
            avatar: user.avatar,
            username: user.username,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            refreshToken: user.generateRefreshToken(),
            accessToken: user.generateRefreshToken(),
          };
        } catch (error) {
          throw new ApiError({
            statusCode: 500,
            message: (error as Error).message,
          });
        }
      },
    }),
    GitHub,
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.avatar = user.avatar;
        token.username = user.username;
        token.email = user.email;
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
});
