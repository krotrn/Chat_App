import { config } from "@/config";
import io, { Socket } from "socket.io-client";
import { ChatEventEnum } from "./socket-event";
import { MessageType } from "@/types/ChatType";

let socket: typeof Socket | null = null;

export const initSocket = (token: string) => {
  if (!socket) {
    if (!config.chatApiUrl) {
      console.log("Chat Api Url Not Defined");
      throw new Error("Chat Api Url Not Defined");
    }
    socket = io(config.chatApiUrl, {
      auth: { token },
      transports: ['websocket'],
    });
    if (!socket) {
      throw new Error("Error Configuring Socket");
    }
    socket.on("connect", () => {
      console.log("connected to socket");
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  }
  return socket;
};

export const joinChat = (chatId: string) => {
  socket?.emit(ChatEventEnum.ONLINE_EVENT, { chatId });
};

export const onMessageReceived = (callback: (message: MessageType) => void) => {
  socket?.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, callback);
};

export const onMessageDeleted = (callback: (message: MessageType) => void) => {
  socket?.on(ChatEventEnum.MESSAGE_DELETE_EVENT, callback);
};

export const onTyping = (callback: (chatId: string) => void) => {
  socket?.on(ChatEventEnum.TYPING_EVENT, callback);
};

export const onStopTyping = (callback: (chatId: string) => void) => {
  socket?.on(ChatEventEnum.STOP_TYPING_EVENT, callback);
};

export const emitTyping = (chatId: string) => {
  socket?.emit(ChatEventEnum.TYPING_EVENT, chatId);
};

export const emitStopTyping = (chatId: string) => {
  socket?.emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
