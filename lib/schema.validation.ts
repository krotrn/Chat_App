import mongoose from "mongoose";
import { z } from "zod";

export const userSchema = z.object({
  user: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user ID",
  }),
});

export const chatIdSchema = z.object({
  chatId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid chat ID",
  }),
});
export const receiverIdSchema = z.object({
  receiverId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid reciver ID",
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
export const groupParticipantsSchema = z.object({
  name: z.string().nonempty(),

  participants: z.array(
    z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid participant ID",
    })
  ),
});

export const messageParamsSchema = z.object({
  chatId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid chat ID",
  }),
  messageId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid message ID",
  }),
});
export const groupParamsSchema = z.object({
  chatId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid chat ID",
  }),
  participantId: z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid message ID",
    }),
});
