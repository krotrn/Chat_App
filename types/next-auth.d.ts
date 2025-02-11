import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    avatarUrl: string | null;
    username: string;
    role: string;
    emailVerified?: date;
  }

  interface Session {
    user: User & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    avatarUrl: string | null;
    username: string;
    email: string;
    role: string;
    emailVerified: date | null;
  }
}

