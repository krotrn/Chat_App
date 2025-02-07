import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserType } from "@/types/User.type";
import { USER_TEMPORARY_TOKEN_EXPIRY, UserLoginType, UserRolesEnum } from "@/utils/constants";



const userSchema = new Schema<UserType>(
  {
    avatar: {
      type: {
        url: { type: String, default: "https://via.placeholder.com/200x200.png" },
        localPath: { type: String, default: "" },
      },
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
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRolesEnum),
      default: UserRolesEnum.USER,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        return this.loginType === UserLoginType.EMAIL_PASSWORD;
      },
    },
    loginType: {
      type: String,
      enum: Object.values(UserLoginType),
      default: UserLoginType.EMAIL_PASSWORD,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
  },
  { timestamps: true }
);

// Ensure fields are indexed for quick lookup
userSchema.index({ email: 1, username: 1 });

// Pre-save hook to hash passwords securely
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Check if provided password matches hashed password
userSchema.methods.isPasswordMatch = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT Access Token
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
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" } as SignOptions // Default 15 min
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" } as SignOptions
  );
};


userSchema.methods.generateTempToken = async function () {
  if (!process.env.TEMP_TOKEN_SECRET) {
    throw new Error("TEMP_TOKEN_SECRET is not defined");
  }

  const array = new Uint8Array(20);
  globalThis.crypto.getRandomValues(array);
  const unHashedToken = Buffer.from(array).toString("hex");

  const encoder = new TextEncoder();
  const data = encoder.encode(unHashedToken);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashedToken = Buffer.from(hashBuffer).toString("hex");

  return {
    unHashedToken,
    hashedToken,
    tokenExpiry: Date.now() + USER_TEMPORARY_TOKEN_EXPIRY,
  };
};

 const User = models.User || model("User", userSchema);

export default User;

