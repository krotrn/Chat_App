export interface UserType {
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