import { ApiError } from "@/lib/api/ApiError";
import { User } from "@/models/auth/user.models";
import { UserType } from "@/types/User.type";
import { UserLoginType } from "./constants";
import { connectToDatabase } from "@/lib/mongoose";

/**
 * Generates both access and refresh tokens for a given user.
 */
const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError({ statusCode: 404, message: "User does not exist" });
    }

    // Generate tokens using instance methods on the user document.
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store the refresh token on the user document.
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError({
      statusCode: 500,
      message:
        "Something went wrong while generating tokens: " +
        (error as Error).message,
    });
  }
};

/**
 * Authenticates the user by email/username and password.
 * Returns an object with user data and tokens on success.
 */
export const authenticateUser = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    await connectToDatabase();
    // Find a user matching the email or username.
    const user: UserType | null = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!user) {
      throw new ApiError({ statusCode: 404, message: "User does not exist" });
    }

    // Ensure the user registered using email/password.
    if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
      throw new ApiError({
        statusCode: 400,
        message: `You have previously registered using ${user.loginType.toLowerCase()}. Please use the ${user.loginType.toLowerCase()} login option to access your account.`,
      });
    }

    // Validate the password.
    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid user credentials",
      });
    }

    // Generate tokens.
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );

    // Retrieve the user data without sensitive fields.
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    return { user: loggedInUser, tokens: { accessToken, refreshToken } };
  } catch (error) {
    new ApiError({
      statusCode: 500,
      message:
        "Something went wrong while authenticating user: " +
        (error as Error).message,
    });
  }
};
