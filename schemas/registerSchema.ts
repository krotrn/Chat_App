import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .nonempty("Email is required")
    .email("Invalid email")
    .toLowerCase(),
  username: z
    .string({ required_error: "username is required" })
    .nonempty({ message: "username is required." })
    .regex(/^[a-zA-Z0-9_]{3,30}$/, "Invalid username format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmpassword: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})
  .refine(({ password, confirmpassword }) => password === confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"]
})
