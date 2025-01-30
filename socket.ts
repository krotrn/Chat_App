import { Server, Socket } from "socket.io";
import cookie from "cookie";
import { ChatEventEnum } from "@/utils/constants";
import { ApiError } from "./utils/ApiError";
import jwt from "jsonwebtoken";
import { User } from "./models/auth/user.models";

interface ChatHandler {
  (socket: Socket): void;
}

const handleJoinChat: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
    console.log(`User joined chat: ${chatId}`);
    socket.join(chatId);
  });
};

const handleTypingEvent: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

const handleStopTypingEvent: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

export const initializeSocket = (io: Server) => {
  io.on("connection", async (socket) => {
    console.log(`🔗 New client connected: ${socket.id}`);
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token = cookies?.accessToken || socket.handshake.auth?.token;
      if (!token)
        throw new ApiError({
          statusCode: 401,
          message: "Unauthorized: Missing token",
          data: null,
        });
      const decodeToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as { _id: string };
      const user = await User.findById(decodeToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );
      if (!user)
        throw new ApiError({
          statusCode: 401,
          message: "Unauthorized: Invalid token",
          data: null,
        });

      socket.user = user;
      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log(`User connected: ${user._id}`);
      handleJoinChat(socket);
      handleTypingEvent(socket);
      handleStopTypingEvent(socket);

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("user has disconnected 🚫. userId: " + socket.user?._id);
        if (socket.user?._id) {
          socket.leave(socket.user._id);
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Socket connection error";
      socket.emit(ChatEventEnum.SOCKET_ERROR_EVENT, errorMessage);
    }
  });
}

export const emitSocketEvent = async (
  req: Request,
  roomId: string,
  event: string,
  payload: unknown
) => {
  const { app } = await req.json();
  app.get("io").in(roomId).emit(event, payload);
};
