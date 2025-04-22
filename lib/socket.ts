import { config } from "@/config";
import io from "socket.io-client";
import { ChatEventEnum } from "./socket-event";
import { MessageType } from "@/types/ChatType";

let socket: SocketIOClient.Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initSocket = (token: string) => {
  if (socket?.connected) {
    return socket;
  }

  if (!config.chatApiUrl) {
    console.error("Chat API URL not defined");
    throw new Error("Chat API URL not defined");
  }

  socket = io(config.chatApiUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    timeout: 20000,
    upgrade: true,
    forceNew: true,
  });

  if (!socket) {
    throw new Error("Error configuring socket connection");
  }
  socket.on("reconnect_attempt", (attempt: number) => {
    reconnectAttempts = attempt;
    console.log(`Reconnection attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`);
  });

  socket.on("reconnect_failed", () => {
    console.error("Socket reconnection failed after maximum attempts");
  });

  socket.on("error", (error: Error) => {
    console.error("Socket error:", error);
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const joinChat = (chatId: string) => {
  if (!socket?.connected) {
    console.warn("Socket not connected, cannot join chat");
    return false;
  }

  socket.emit(ChatEventEnum.ONLINE_EVENT, chatId);
  return true;
};

export const onMessageReceived = (callback: (message: MessageType) => void) => {
  socket?.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, callback);
  return () => socket?.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT, callback);
};

export const onMessageDeleted = (callback: (message: MessageType) => void) => {
  socket?.on(ChatEventEnum.MESSAGE_DELETE_EVENT, callback);
  return () => socket?.off(ChatEventEnum.MESSAGE_DELETE_EVENT, callback);
};

export const onTyping = (callback: (chatId: string) => void) => {
  socket?.on(ChatEventEnum.TYPING_EVENT, callback);
  return () => socket?.off(ChatEventEnum.TYPING_EVENT, callback);
};

export const onStopTyping = (callback: (chatId: string) => void) => {
  socket?.on(ChatEventEnum.STOP_TYPING_EVENT, callback);
  return () => socket?.off(ChatEventEnum.STOP_TYPING_EVENT, callback);
};

export const emitTyping = (chatId: string) => {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.TYPING_EVENT, chatId);
    return true;
  }
  return false;
};

export const emitStopTyping = (chatId: string) => {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
    return true;
  }
  return false;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocketStatus = () => {
  return {
    connected: socket?.connected || false,
    reconnectAttempts,
  };
};
