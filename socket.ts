import { Server, Socket as BaseSocket } from "socket.io";
import { auth } from "@/auth";
import { ChatEventEnum } from "@/lib/chat/constants";
import { ApiError } from "@/lib/api/ApiError";
import { User } from "@/models/auth/user.models";
import { UserType } from "@/types/User.type";

interface Socket extends BaseSocket {
  user?: UserType;
}

interface ChatHandler {
  (socket: Socket): void;
}

const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error | undefined) => void
) => {
  try {
    const session = await auth();

    if (!session || !session.user?._id) {
      return next(new ApiError({ statusCode: 401, message: "Unauthorized: Missing or invalid session" }));
    }

    const user = await User.findOne({ _id: session.user._id }).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry").lean();

    if (!user) {
      return next(new ApiError({ statusCode: 401, message: "Unauthorized: User not found" }));
    }

    socket.user = user;
    socket.join(user._id.toString());
    console.log(`✅ User authenticated: ${user._id}`);

    next();
  } catch (error) {
    next(new ApiError({ statusCode: 500, data: error, message: "Authentication error" }));
  }
};

const handleJoinChat: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
    console.log(`📌 User joined chat: ${chatId}`);
    socket.join(chatId);
  });
};

const handleTypingEvents: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
    socket.to(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });

  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.to(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

const handleDisconnection: ChatHandler = (socket) => {
  socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
    console.log(`🚫 User disconnected: ${socket.user?._id}`);
    if (socket.user?._id) {
      socket.leave(socket.user._id.toString());
    }
  });
};

const registerEventHandlers = (socket: Socket) => {
  handleJoinChat(socket);
  handleTypingEvents(socket);
  handleDisconnection(socket);
};

export const initializeSocket = (io: Server) => {
  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    console.log(`🔗 New client connected: ${socket.id}`);
    socket.emit(ChatEventEnum.CONNECTED_EVENT);
    registerEventHandlers(socket);
  });
};

export const emitSocketEvent = async (
  req: Request,
  roomId: string,
  event: string,
  payload: unknown
) => {
  try {
    const { app } = await req.json();
    const io: Server = app.get("io");
    io.to(roomId).emit(event, payload);
  } catch (error) {
    console.error("Error emitting socket event:", error);
  }
};