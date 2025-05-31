import { z } from "zod";

export const groupDetailsSchema = z.object({
  groupname: z.string().nonempty("Group name is required"),
  description: z.string().optional(),
  members: z.array(z.object({
    userId: z.string().nonempty("User ID is required"),
    name: z.string().nonempty("Name is required"),
    avatarUrl: z.string().url("Invalid image URL").optional(),
    role: z.enum(["member", "admin"]).default("member").optional(),
    joinedAt: z.date().default(() => new Date()).optional(),
  })).min(1, "At least one member is required"),
  avatarUrl: z.string().url("Invalid image URL").optional(),
})