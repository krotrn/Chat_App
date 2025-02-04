import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/api/ApiError";
import { UserType } from "@/types/User.type";

export const verifyToken = (token: string) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return {
      _id: (decoded as UserType)._id,
      email: (decoded as UserType).email,
      username: (decoded as UserType).username,
      role: (decoded as UserType).role,
    };
  } catch (error: unknown) {
    throw new ApiError({
      statusCode: 401,
      message: (error as NodeJS.ErrnoException).message,
    });
  }
};
