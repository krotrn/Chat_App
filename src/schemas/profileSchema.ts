import { UserRoles } from "@prisma/client";
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().nonempty("Set the name."),
  bio: z.string().optional(),
  avatar: z
    .instanceof(File)
    .refine(
      (file) =>
        [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/svg+xml",
          "image/gif",
        ].includes(file.type),
      "Invalid image file type",
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "File size should not exceed 2MB",
    })
    .optional(),
  status: z.string().optional(),
  username: z.string(),
  role: z.enum([UserRoles.USER, UserRoles.ADMIN]),
  email: z.string().email("Invalid email format"),
});
