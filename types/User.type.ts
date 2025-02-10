import mongoose from "mongoose";

export interface UserType extends mongoose.Document<mongoose.Types.ObjectId> {
  avatar: {
    url: string;
    localPath: string;
  };
  username: string;
  email: string;
  role: string;
  password: string;
  loginType: string;
  emailVerified: Date | null
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  isPasswordMatch: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
  generateTempToken: () => string;
}
