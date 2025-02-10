import "next-auth";
import { DefaultSession } from "next-auth";
import { AdapterUser as DefaultAdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface User {
    id: string;
    avatarUrl?: string;
    email: string;
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
    username: string;
    email: string;
    role: string;
    emailVerified: date | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends DefaultAdapterUser {
    role: string;
    emailVerified: date | null;
    username: string;
  }
}
