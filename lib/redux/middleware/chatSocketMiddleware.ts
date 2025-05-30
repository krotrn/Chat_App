import type { Middleware } from "@reduxjs/toolkit";
import { CONNECT_SOCKET, ConnectSocketPayload } from "../chatSocketActions";
import {
  setConnectionState,
  addMessage,
  updateMessage,
  removeMessage,
  addChat,
  updateChat,
  removeChat,
  addPinnedMessageId,
  removePinnedMessageId,
  clearChatState,
  setCurrentChat,
} from "../slices/chat-slice";
import { ConnectionState, MessageType, ChatType } from "@/types/ChatType";
import { initSocket, joinChat, getSocket, setSocket } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";

export const chatSocketMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (action && typeof action === "object" && "type" in action) {
      switch (
        (
          action as unknown as { type: string } & {
            payload: ConnectSocketPayload;
          }
        ).type
      ) {
        case CONNECT_SOCKET: {
          const { chat, token } = (
            action as unknown as { payload: ConnectSocketPayload }
          ).payload;
          const existingSocket = getSocket();
          if (existingSocket) {
            existingSocket.removeAllListeners();
            existingSocket.disconnect();
          }
          store.dispatch(clearChatState());
          const socket: SocketIOClient.Socket = initSocket(token);
          setSocket(socket);
          store.dispatch(setCurrentChat(chat));
          store.dispatch(setConnectionState(ConnectionState.CONNECTING));
          if (!socket) {
            store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
            return;
          }
          socket.on("connect", () => {
            console.log("Socket connected");
            store.dispatch(setConnectionState(ConnectionState.CONNECTED));
            joinChat(chat._id);
          });
          socket.io.on("reconnect_attempt", (attempt: number) => {
            console.log(`Reconnecting attempt #${attempt}`);
            store.dispatch(setConnectionState(ConnectionState.RECONNECTING));
          });
          socket.io.on("reconnect_failed", () => {
            store.dispatch(setConnectionState(ConnectionState.FAILED));
          });
          socket.on(
            ChatEventEnum.MESSAGE_RECEIVED_EVENT,
            (message: MessageType) => {
              store.dispatch(addMessage(message));
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_REACTION_EVENT,
            (message: MessageType) => {
              store.dispatch(updateMessage(message));
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_PINNED_EVENT,
            (data: { chatId: string; messageId: string }) => {
              store.dispatch(addPinnedMessageId(data.messageId));
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_UNPINNED_EVENT,
            (data: { chatId: string; messageId: string }) => {
              store.dispatch(removePinnedMessageId(data.messageId));
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_DELETE_EVENT,
            (data: { chatId: string; messageId: string }) => {
              store.dispatch(removeMessage(data.messageId));
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_EDITED_EVENT,
            (message: MessageType) => {
              store.dispatch(updateMessage(message));
            }
          );
          socket.on(ChatEventEnum.NEW_CHAT_EVENT, (chat: ChatType) => {
            store.dispatch(addChat(chat));
          });
          socket.on(ChatEventEnum.CHAT_UPDATED_EVENT, (chat: ChatType) => {
            store.dispatch(updateChat(chat));
          });
          socket.on(ChatEventEnum.CHAT_DELETED_EVENT, (chat: ChatType) => {
            store.dispatch(removeChat(chat._id));
          });
          socket.on(ChatEventEnum.REMOVED_FROM_CHAT, (chat: ChatType) => {
            store.dispatch(removeChat(chat._id));
          });
          socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, () => {
            store.dispatch(setConnectionState(ConnectionState.FAILED));
          });
          socket.on("disconnect", () => {
            store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
          });
          break;
        }
      }
    }
    return next(action);
  };
