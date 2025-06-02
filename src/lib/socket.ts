import { config } from "@/config";
import io from "socket.io-client";
import { ChatEventEnum } from "@/lib/socket-event";

let socket: SocketIOClient.Socket | null = null;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initSocket(token: string): SocketIOClient.Socket {
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
  });

  if (!socket) {
    throw new Error("Error configuring socket connection");
  }
  socket.on("reconnect_attempt", (attempt: number) => {
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
}

export function getSocket(): SocketIOClient.Socket | null {
  return socket;
}

export function setSocket(s: SocketIOClient.Socket | null): void {
  socket = s;
}

export function joinChat(chatId: string): boolean {
  if (!socket?.connected) {
    return false;
  }

  socket.emit(ChatEventEnum.ONLINE_EVENT, chatId);
  return true;
}

export function leaveChat(chatId: string): boolean {
  if (!socket?.connected) {
    console.warn("Socket not connected, cannot leave chat");
    return false;
  }
  socket.emit(ChatEventEnum.OFFLINE_EVENT, chatId);
  return true;
}

export function onTyping(callback: (data: { userId: string; chatId:string}) => void): () => void {
  socket?.on(ChatEventEnum.TYPING_EVENT, (data: { userId: string; chatId:string}) => {
    callback(data);
  });
  return () => {
    socket?.off(ChatEventEnum.TYPING_EVENT, callback);
  };
}

export function onStopTyping(callback: (data: { userId: string; chatId:string}) => void): () => void {
  socket?.on(ChatEventEnum.STOP_TYPING_EVENT, (data: { userId: string; chatId:string}) => {
    callback(data);
  });
  return () => {
    socket?.off(ChatEventEnum.STOP_TYPING_EVENT, callback);
  };
}

export function emitTyping(data: { userId: string; chatId:string}): boolean {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.TYPING_EVENT, data);
    return true;
  }
  return false;
}

export function emitStopTyping(data: { userId: string; chatId:string}): boolean {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.STOP_TYPING_EVENT, data);
    return true;
  }
  return false;
}
