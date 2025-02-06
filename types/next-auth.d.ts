import "next-auth";
import { DefaultSession } from "next-auth";


declare module "next-auth" {
  interface User {
    _id: string;
    avatar: {
      url: string;
      localPath: string;
    };
    username: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    refreshToken: string;
    accessToken: string;
  }

  interface Session {
    user: User & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    avatar: {
      url: string;
      localPath: string;
    };
    username: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    refreshToken: string;
    accessToken: string;
  }
}
