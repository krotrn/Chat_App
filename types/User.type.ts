import mongoose from "mongoose";

export interface UserType
  extends mongoose.Document<mongoose.Document<mongoose.Schema.Types.ObjectId>> {
  avatar: {
    url: string;
    localPath: string;
  };
  username: string;
  email: string;
  role: string;
  password: string;
  loginType: string;
  isEmailVerified: boolean;
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
}
