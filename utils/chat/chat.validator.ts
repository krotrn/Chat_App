import { z } from "zod";
import mongoose from "mongoose";

export const chatIdSchema = z.object({
  chatId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid chat ID",
  }),
});

export const messageSchema = z.object({
  content: z.string().optional(),
  files: z
    .object({
      attachments: z
        .array(
          z.object({
            filename: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});