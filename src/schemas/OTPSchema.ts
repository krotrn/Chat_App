import { z } from "zod";

export const OTPSchema = z.object({
  email: z.string().email().nonempty(),
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});
