import mongoose from "mongoose";
import { z } from "zod";

export const userSchema = z.object({
  user: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user ID",
  }),
});