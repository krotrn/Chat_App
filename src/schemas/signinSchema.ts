import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email/username is required")
    .max(255)
    .refine((val) => {
      const isEmail = z.string().email().safeParse(val).success;
      const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(val);
      return isEmail || isUsername;
    }, "Invalid email or username format"),
  password: z.string().nonempty(),
});
