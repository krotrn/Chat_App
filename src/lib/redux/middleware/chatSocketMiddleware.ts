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
import {
  ConnectionState,
  MessageType,
  ChatType,
  MessagesPageData,
} from "@/types/ChatType";
import { initSocket, joinChat, getSocket, setSocket } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/config";

let queryClient: QueryClient | null = null;
export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

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
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(message.chatId, 20),
                  (old) => {
                    if (!old) return old;

                    // Check if message already exists (avoid duplicates)
                    const messageExists = old.pages.some((page) =>
                      page.messages.some(
                        (msg: MessageType) => msg._id === message._id
                      )
                    );

                    if (!messageExists) {
                      const newPages = [...old.pages];
                      if (newPages[0]) {
                        newPages[0] = {
                          ...newPages[0],
                          messages: [
                            message,
                            ...newPages[0].messages,
                          ],
                        };
                      }
                      return { ...old, pages: newPages };
                    }
                    return old;
                  }
                );
              }
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_REACTION_EVENT,
            (newMessage: MessageType) => {
              store.dispatch(updateMessage(newMessage));
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(newMessage.chatId, 20),
                  (old) => {
                    if (!old) return;
                    const newPages = old.pages.map((page) => {
                      const newMessages: MessageType[] = page.messages.map(
                        (message) => {
                          return message._id === newMessage._id
                            ? newMessage
                            : message;
                        }
                      );
                      return { ...page, messages: newMessages };
                    });
                    return { ...old, pages: newPages };
                  }
                );
              }
            }
          );

          socket.on(
            ChatEventEnum.MESSAGE_PINNED_EVENT,
            (data: { chatId: string; messageId: string }) => {
              store.dispatch(addPinnedMessageId(data.messageId));
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(data.chatId, 20),
                  (old) => {
                    if (!old) return old;

                    const newPages = old.pages.map((page) => ({
                      ...page,
                      messages: page.messages.map((msg: MessageType) =>
                        msg._id === data.messageId
                          ? { ...msg, isPinned: true }
                          : msg
                      ),
                    }));

                    return { ...old, pages: newPages };
                  }
                );
              }
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_UNPINNED_EVENT,
            (data: { chatId: string; messageId: string }) => {
              store.dispatch(removePinnedMessageId(data.messageId));
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(data.chatId, 20),
                  (old) => {
                    if (!old) return old;

                    const newPages = old.pages.map((page) => ({
                      ...page,
                      messages: page.messages.map((msg: MessageType) =>
                        msg._id === data.messageId
                          ? { ...msg, isPinned: true }
                          : msg
                      ),
                    }));

                    return { ...old, pages: newPages };
                  }
                );
              }
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_DELETE_EVENT,
            (data: { chatId: string; messageId: string }) => {
              store.dispatch(removeMessage(data.messageId));
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(data.chatId, 20),
                  (old) => {
                    if (!old) return old;

                    const newPages = old.pages.map((page) => ({
                      ...page,
                      messages: page.messages.filter(
                        (msg) => msg._id !== data.messageId
                      ),
                    }));

                    return { ...old, pages: newPages };
                  }
                );
              }
            }
          );
          socket.on(
            ChatEventEnum.MESSAGE_EDITED_EVENT,
            (message: MessageType) => {
              store.dispatch(updateMessage(message));
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(message.chatId, 20),
                  (old) => {
                    if (!old) return old;

                    const newPages = old.pages.map((page) => {
                      const newMessages: MessageType[] = page.messages.map(
                        (msg) => (msg._id === message._id ? message : msg)
                      );
                      return { ...page, messages: newMessages };
                    });
                    return { ...old, pages: newPages };
                  }
                );
              }
            }
          );
          socket.on(ChatEventEnum.NEW_CHAT_EVENT, (chat: ChatType) => {
            store.dispatch(addChat(chat));
            if (queryClient) {
              queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
            }
          });
          socket.on(ChatEventEnum.CHAT_UPDATED_EVENT, (chat: ChatType) => {
            store.dispatch(updateChat(chat));
            if (queryClient) {
              queryClient.setQueryData(queryKeys.chats.detail(chat._id), chat);
            }
          });
          socket.on(ChatEventEnum.CHAT_DELETED_EVENT, (chat: ChatType) => {
            store.dispatch(removeChat(chat._id));
            if (queryClient) {
              queryClient.removeQueries({
                queryKey: queryKeys.chats.detail(chat._id),
              });
              queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
            }
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
