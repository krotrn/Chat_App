import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .nonempty("Email is required")
    .email("Invalid email"),
  username: z
    .string({ required_error: "username is required" })
    .nonempty({ message: "username is required." }),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});