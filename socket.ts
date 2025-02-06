import { Server, Socket as BaseSocket } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { ChatEventEnum } from "@/lib/chat/constants";
import { ApiError } from "@/lib/api/ApiError";
import { User } from "@/models/auth/user.models";
import { UserType } from "@/types/User.type";

interface Socket extends BaseSocket {
  user?: UserType;
}

type ChatHandler = (socket: Socket) => void;

/**
 * Middleware to authenticate WebSocket connections using JWT.
 */
const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    const token = cookies.accessToken || socket.handshake.auth?.token;

    if (!token) {
      return next(new ApiError({ statusCode: 401, message: "Unauthorized: Missing token" }));
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { _id: string };
    } catch {
      return next(new ApiError({ statusCode: 401, message: "Unauthorized: Invalid or expired token" }));
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
      return next(new ApiError({ statusCode: 401, message: "Unauthorized: User not found" }));
    }

    socket.user = user;
    socket.join(user._id.toString());
    console.log(`✅ User authenticated: ${user._id}`);

    next();
  } catch (error) {
    next(new ApiError({ statusCode: 500, message: "Authentication error", data: error }));
  }
};

/**
 * Handles user joining a chat room.
 */
const handleJoinChat: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
    console.log(`📌 User joined chat: ${chatId}`);
    socket.join(chatId);
  });
};

/**
 * Handles real-time typing notifications.
 */
const handleTypingEvents: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
    socket.to(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });

  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.to(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

/**
 * Handles user disconnection and removes them from all joined rooms.
 */
const handleDisconnection: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
    console.log(`🚫 User disconnected: ${socket.user?._id}`);

    if (socket.user?._id) {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        socket.leave(room);
        console.log(`🔴 User left room: ${room}`);
      });
    }
  });
};

/**
 * Registers all event handlers for an authenticated socket.
 */
const registerEventHandlers = (socket: Socket) => {
  if (!socket.user) {
    console.warn("❌ Attempted event registration without authentication.");
    return;
  }

  handleJoinChat(socket);
  handleTypingEvents(socket);
  handleDisconnection(socket);
};

/**
 * Initializes WebSocket server and applies authentication middleware.
 */
export const initializeSocket = (io: Server) => {
  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    console.log(`🔗 New client connected: ${socket.id}`);
    socket.emit(ChatEventEnum.CONNECTED_EVENT);
    registerEventHandlers(socket);
  });
};

/**
 * Emits a WebSocket event to a specified room.
 */
export const emitSocketEvent = (io: Server, roomId: string, event: string, payload: unknown) => {
  try {
    io.to(roomId).emit(event, payload);
  } catch (error) {
    console.error("❌ Error emitting socket event:", error);
  }
};
