import mongoose from "mongoose";
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("Define MONGO_URI in .env");
}

interface MongooseCache {
  connection: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

const cached: MongooseCache = (
  global as typeof globalThis & { mongoose: MongooseCache }
).mongoose || { connection: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.connection) {
    return cached.connection;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: process.env.DB_NAME || "defaultDb",
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((mongoose) => mongoose.connection);
    mongoose.connection.on("connected", () => {
      console.log("Connected to database");
    });
    mongoose.connection.on("error", (err) => {
      console.log("Error connecting to database", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Disconnected from database");
    });
  }

  cached.connection = await cached.promise;
  (global as typeof globalThis & { mongoose: MongooseCache }).mongoose = cached;
  return cached.connection;
};
