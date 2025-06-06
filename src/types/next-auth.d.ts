import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    avatarUrl: string | null;
    name: string | null;
    email: string;
    status: string | null;
    role: string;
    bio?: string;
  }

  interface Session {
    user: DefaultSession["user"] & User;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    user: {
      id: string;
      avatarUrl: string | null;
      username: string;
      email: string;
      role: string;
      emailVerified: date | null;
    };
  }
}
