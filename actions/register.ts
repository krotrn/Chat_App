"use server";

import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/auth/user.models";
import { registerSchema } from "@/schemas/registerSchema";
import { UserType } from "@/types/User.type";
import { UserLoginType, UserRolesEnum } from "@/utils/constants";
import { z } from "zod";

export const register = async (credentials: z.infer<typeof registerSchema>) => {
  try {
    const parsedData = registerSchema.safeParse(credentials);
    if (!parsedData.success) {
      return { error: "Invalid field." };
    }

    await connectToDatabase();

    const { email, username, password } = parsedData.data;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    })
      .select("_id")
      .lean();

    if (existingUser) {
      return { error: "user already exist." };
    }

    const user: UserType = await User.create({
      email,
      username,
      password,
      role: UserRolesEnum.USER,
      loginType: UserLoginType.EMAIL_PASSWORD,
    });
    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id).select("_id").lean();
    if (!createdUser) {
      return { error: "Error on creating user." };
    }
    return {success: "Successfully registered."}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "something went wrong." };
  }
};
