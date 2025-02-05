import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  username: z
    .string({ required_error: "username is required" })
    .nonempty({ message: "username is required." }),
  password: z
    .string({ required_error: "Password is required" })
    .nonempty("Password is Required")
});