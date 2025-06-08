import { getSocket } from "./connection";
import { ChatEventEnum } from "@/lib/socket-event";
import type { SocketEventCallback } from "./types";

export function emitUserOnline(): boolean {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit(ChatEventEnum.USER_ONLINE_EVENT);
    return true;
  }
  return false;
}

export function emitUserOffline(): boolean {
  const socket = getSocket();
  if (socket?.connected) {
    socket.emit(ChatEventEnum.USER_OFFLINE_EVENT);
    return true;
  }
  return false;
}

export function emitJoinChat(chatId: string): boolean {
  const socket = getSocket();
  if (!socket?.connected) {
    return false;
  }

  socket.emit(
    ChatEventEnum.JOIN_CHAT_EVENT,
    { chatId },
    (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log(`Successfully joined chat: ${chatId}`);
      } else {
        console.error(
          `Failed to join chat: ${response.error || "Unknown error"}`,
        );
      }
    },
  );
  return true;
}

export function emitLeaveChat(chatId: string): boolean {
  const socket = getSocket();
  if (!socket?.connected) {
    console.warn("Socket not connected, cannot leave chat");
    return false;
  }
  socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatId);
  return true;
}

export function onUserOnline(
  callback: SocketEventCallback<{ userId: string }>,
): () => void {
  const socket = getSocket();
  socket?.on(ChatEventEnum.USER_IS_ONLINE_EVENT, callback);
  return () => {
    socket?.off(ChatEventEnum.USER_IS_ONLINE_EVENT, callback);
  };
}

export function onUserOffline(
  callback: SocketEventCallback<{ userId: string }>,
): () => void {
  const socket = getSocket();
  socket?.on(ChatEventEnum.USER_IS_OFFLINE_EVENT, callback);
  return () => {
    socket?.off(ChatEventEnum.USER_IS_OFFLINE_EVENT, callback);
  };
}

export function onOnlineUsersList(
  callback: SocketEventCallback<{ onlineUserIds: string[] }>,
): () => void {
  const socket = getSocket();
  socket?.on(ChatEventEnum.ONLINE_USERS_LIST_EVENT, callback);
  return () => {
    socket?.off(ChatEventEnum.ONLINE_USERS_LIST_EVENT, callback);
  };
}
