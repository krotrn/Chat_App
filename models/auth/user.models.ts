import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserType } from "@/types/User.type";
export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableSocialLogins = Object.values(UserLoginType);

const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000;

const userSchema = new Schema<UserType>(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://via.placeholder.com/200x200.png`,
        localPath: "",
      },
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index:true,
      },
      role: {
        type: String,
        enum: AvailableUserRoles,
        default: UserRolesEnum.USER,
        required: true,
      },
      password: {
        type: String,
        required: [true, "Password is required"],
      },
      loginType: {
        type: String,
        enum: AvailableSocialLogins,
        default: UserLoginType.EMAIL_PASSWORD,
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      refreshToken: {
        type: String,
      },
      forgotPasswordToken: {
        type: String,
      },
      forgotPasswordExpiry: {
        type: Date,
      },
      emailVerificationToken: {
        type: String,
      },
      emailVerificationExpiry: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
});

userSchema.methods.isPasswordMatch = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY as string, 10) }
  );
};

userSchema.methods.generateRefreshToken = function () {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY as string, 10) }
  );
};

userSchema.methods.generateTempToken = function () {
  if (!process.env.TEMP_TOKEN_SECRET) {
    throw new Error("TEMP_TOKEN_SECRET is not defined");
  }
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;
  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User: Model<UserType> =
  mongoose.models.User || mongoose.model<UserType>("User", userSchema);
