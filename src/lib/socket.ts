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
    reconnectionDelayMax: 5000,
    timeout: 20000,
    upgrade: true,
    forceNew: true,
  });

  if (!socket) {
    throw new Error("Error configuring socket connection");
  }

  socket.on("connect", () => {
    console.log("Socket connected successfully");
  });

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

  socket.on("disconnect", (reason: string) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("pong", (data: { timestamp: number }) => {
    console.log("Received pong from server:", data);
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

  socket.emit(
    ChatEventEnum.JOIN_CHAT_EVENT,
    { chatId },
    (response: { success: boolean; error?: string }) => {
      if (response.success) {
        console.log(`Successfully joined chat: ${chatId}`);
      } else {
        console.error(
          `Failed to join chat: ${response.error || "Unknown error"}`
        );
      }
    }
  );
  return true;
}

export function leaveChat(chatId: string): boolean {
  if (!socket?.connected) {
    console.warn("Socket not connected, cannot leave chat");
    return false;
  }
  socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatId);
  return true;
}


export function emitTyping(data: { userId: string; chatId: string; }): boolean { 
  if (socket?.connected) {
    socket.emit(ChatEventEnum.TYPING_EVENT, data);
    return true;
  }
  return false;
}

export function emitStopTyping(data: {
  userId: string;
  chatId: string;
}): boolean {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.STOP_TYPING_EVENT, data);
    return true;
  }
  return false;
}

export function emitUserOnline(): boolean {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.USER_ONLINE_EVENT);
    return true;
  }
  return false;
}

export function emitUserOffline(): boolean {
  if (socket?.connected) {
    socket.emit(ChatEventEnum.USER_OFFLINE_EVENT);
    return true;
  }
  return false;
}

export function onUserOnline(
  callback: (data: { userId: string }) => void
): () => void {
  socket?.on(ChatEventEnum.USER_IS_ONLINE_EVENT, callback);
  return () => {
    socket?.off(ChatEventEnum.USER_IS_ONLINE_EVENT, callback);
  };
}

export function onUserOffline(
  callback: (data: { userId: string }) => void
): () => void {
  socket?.on(ChatEventEnum.USER_IS_OFFLINE_EVENT, callback);
  return () => {
    socket?.off(ChatEventEnum.USER_IS_OFFLINE_EVENT, callback);
  };
}

export function ononlineUserIdsList(
  callback: (data: { onlineUserIds: string[] }) => void
): () => void {
  socket?.on(ChatEventEnum.ONLINE_USERS_LIST_EVENT, callback);
  return () => {
    socket?.off(ChatEventEnum.ONLINE_USERS_LIST_EVENT, callback);
  };
}


export function checkSocketHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve(false);
      return;
    }

    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);

    socket.emit(
      "ping",
      { timestamp: Date.now() },
      (response: { timestamp: number }) => {
        clearTimeout(timeout);
        resolve(Boolean(response && response.timestamp));
      }
    );
  });
}

export function forceReconnect(): void {
  if (socket) {
    console.log("Forcing socket disconnection and reconnection");
    socket.disconnect();
    socket.connect();
  }
}

export function isSocketReallyConnected(): boolean {
  return Boolean(socket && socket.connected && socket.id);
}
