import io from "socket.io-client";
import { config } from "@/config";
import type { SocketConfig } from "./types";

let socket: SocketIOClient.Socket | null = null;

export function initializeSocket(token: string): SocketIOClient.Socket {
  if (socket?.connected) {
    return socket;
  }

  if (!config.chatApiUrl) {
    console.error("Chat API URL not defined");
    throw new Error("Chat API URL not defined");
  }

  const socketConfig: SocketConfig = {
    apiUrl: config.chatApiUrl,
    token,
    maxReconnectAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  };

  socket = io(socketConfig.apiUrl, {
    auth: { token: socketConfig.token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: socketConfig.maxReconnectAttempts,
    reconnectionDelay: socketConfig.reconnectionDelay,
    reconnectionDelayMax: 5000,
    timeout: socketConfig.timeout,
    upgrade: true,
    forceNew: true,
  });

  if (!socket) {
    throw new Error("Error configuring socket connection");
  }

  setupConnectionListeners();
  return socket;
}

function setupConnectionListeners(): void {
  if (!socket) return;

  socket.on("connect", () => {
    console.log("Socket connected successfully");
  });

  socket.on("reconnect_attempt", (attempt: number) => {
    console.log(`Reconnection attempt ${attempt}`);
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
}

export function getSocket(): SocketIOClient.Socket | null {
  return socket;
}

export function setSocket(newSocket: SocketIOClient.Socket | null): void {
  socket = newSocket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    setSocket(null);
  }
}

export function isSocketConnected(): boolean {
  return Boolean(socket && socket.connected && socket.id);
}
