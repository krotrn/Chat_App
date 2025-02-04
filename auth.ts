import NextAuth from "next-auth"
import { ZodError } from "zod"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./lib/zod"
import { authenticateUser } from "@/utils/db"
import { ApiError } from "./lib/api/ApiError";
import { DefaultSession } from "next-auth";
import { UserType } from "./types/User.type";


declare module "next-auth" {
  interface Session {
    user: UserType & DefaultSession["user"]
  }
}

 
export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate and parse the credentials.
          const { email, username, password } =
            await signInSchema.parseAsync(credentials);

          // Authenticate the user and generate tokens.
          const { user, tokens } = await authenticateUser(
            email,
            username,
            password
          );

          if (!user) {
            throw new ApiError({ statusCode: 404, message: "User does not exist" });
          }

          // Optionally attach token data to the user object.
          // This will be available in the JWT and session callbacks.
          return { ...user.toObject(), ...tokens };
        } catch (error) {
          // Log validation errors (Zod) or authentication errors.
          if (error instanceof ZodError) {
            console.error("Validation error:", error.flatten());
          } else {
            console.error("Authentication error:", error);
          }
          return null; // Returning null signals an authentication failure.
        }
      },
    }),
  ],
  callbacks: {
    /**
     * The jwt callback is called when a token is created or updated.
     * We merge the user data (if present) into the token.
     */
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },
    /**
     * The session callback is called whenever a session is checked.
     * We attach the token (which includes user and token data) to the session.
     */
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management.
  },
})