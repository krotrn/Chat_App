import type { Middleware } from "@reduxjs/toolkit";
import { setConnectionState } from "@/lib/redux/slices/connection-slice";
import { ConnectionState } from "@/types";
import {
  INITIALIZE_SOCKET,
  TERMINATE_SOCKET,
  InitializeSocketPayload,
} from "@/lib/redux/chatSocketActions";
import {
  initializeSocket,
  getSocket,
  setSocket,
  disconnectSocket,
} from "@/features/socket/connection";
import { emitUserOnline } from "@/features/socket/events";
import { ChatEventEnum } from "@/lib/socket-event";

export const connectionMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (typeof action !== "object" || !action || !("type" in action)) {
      return next(action);
    }

    switch (action.type) {
      case INITIALIZE_SOCKET: {
        const existingSocket = getSocket();
        if (existingSocket?.connected) {
          console.warn("Socket already initialized and connected");
          return next(action);
        }

        if (existingSocket) {
          existingSocket.removeAllListeners();
          existingSocket.disconnect();
          setSocket(null);
        }

        const { token } = (
          action as unknown as { payload: InitializeSocketPayload }
        ).payload;
        const socket = initializeSocket(token);
        setSocket(socket);
        store.dispatch(setConnectionState(ConnectionState.CONNECTING));

        socket.on("connect", () => {
          store.dispatch(setConnectionState(ConnectionState.CONNECTED));
          setTimeout(() => {
            emitUserOnline();
            console.log("Socket connected successfully and user is online");
          }, 100);
        });

        socket.on("connect_error", (error: Error) => {
          console.log("Socket connection error:", error);
          store.dispatch(setConnectionState(ConnectionState.FAILED));
        });

        socket.on("disconnect", (reason: string) => {
          console.log("Socket disconnected:", reason);
          store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
        });

        socket.io.on("reconnect_attempt", (attempt: number) => {
          console.log(`Reconnecting attempt #${attempt}`);
          store.dispatch(setConnectionState(ConnectionState.RECONNECTING));
        });

        socket.io.on("reconnect_failed", () => {
          console.error("Socket reconnection failed");
          store.dispatch(setConnectionState(ConnectionState.FAILED));
        });

        socket.io.on("reconnect", () => {
          console.log("Socket reconnected successfully");
          store.dispatch(setConnectionState(ConnectionState.CONNECTED));
          setTimeout(() => {
            emitUserOnline();
            console.log("User marked as online after reconnection");

            const currentChat = store.getState().currentChat.currentChat;
            if (currentChat) {
              console.log(
                `Rejoining chat ${currentChat._id} after reconnection`,
              );
              socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, currentChat._id);
            }
          }, 500);
        });

        socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, () => {
          store.dispatch(setConnectionState(ConnectionState.FAILED));
        });

        break;
      }
      case TERMINATE_SOCKET: {
        disconnectSocket();
        store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
        console.log("Socket terminated and disconnected");
        break;
      }
    }

    return next(action);
  };
