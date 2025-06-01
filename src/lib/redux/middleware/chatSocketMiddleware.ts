import type { Middleware } from "@reduxjs/toolkit";
import {
  CONNECT_SOCKET,
  ConnectSocketPayload,
} from "@/lib/redux/chatSocketActions";
import {
  setConnectionState,
  updateMessage,
  removeMessage,
  addChat,
  updateChat,
  removeChat,
  addPinnedMessageId,
  removePinnedMessageId,
  clearChatState,
  setCurrentChat,
} from "@/lib/redux/slices/chat-slice";
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
              // Don't dispatch to Redux store to avoid duplication with optimistic updates
              // store.dispatch(addMessage(message));
              if (queryClient) {
                queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                  queryKeys.messages.infinite(message.chatId, 20),
                  (old) => {
                    if (!old) return old;

                    // Check if this is a real message we already have
                    const realMessageExists = old.pages.some((page) =>
                      page.messages.some(
                        (msg: MessageType) => msg._id === message._id
                      )
                    );

                    if (realMessageExists) {
                      // Message already exists, don't add duplicate
                      return old;
                    }

                    // Check if we have an optimistic message for this content
                    let hasOptimisticMessage = false;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      messages: page.messages.map((msg) => {
                        // Look for optimistic messages with similar content and timing
                        if (
                          msg._id.startsWith("temp-") &&
                          msg.content === message.content &&
                          msg.sender.userId === message.sender.userId &&
                          Math.abs(
                            new Date(msg.createdAt).getTime() -
                              new Date(message.createdAt).getTime()
                          ) < 10000
                        ) {
                          hasOptimisticMessage = true;
                          return message; // Replace optimistic with real message
                        }
                        return msg;
                      }),
                    }));

                    if (hasOptimisticMessage) {
                      // We found and replaced an optimistic message
                      return { ...old, pages: newPages };
                    } else {
                      // This is a new message from someone else, add it
                      const addPages = [...old.pages];
                      if (addPages[0]) {
                        addPages[0] = {
                          ...addPages[0],
                          messages: [message, ...addPages[0].messages],
                        };
                      }
                      return { ...old, pages: addPages };
                    }
                  }
                );
                queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
                  queryKeys.chats.infinite(20),
                  (old) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      chats: page.chats.map((chat) => {
                        if (chat._id === message.chatId) {
                          return {
                            ...chat,
                            lastMessage: message,
                          };
                        }
                        return chat;
                      }),
                    }));
                    return { ...old, pages: newPages };
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
                          ? { ...msg, isPinned: false }
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
                queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
                  queryKeys.chats.infinite(20),
                  (old) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      chats: page.chats.map((chat) => {
                        if (chat._id === data.chatId) {
                          return {
                            ...chat,
                            lastMessage:
                              chat.lastMessage?._id === data.messageId
                                ? null
                                : chat.lastMessage,
                          };
                        }
                        return chat;
                      }),
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
                queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
                  queryKeys.chats.infinite(20),
                  (old) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      chats: page.chats.map((chat) => {
                        if (chat._id === message.chatId) {
                          return {
                            ...chat,
                            lastMessage:
                              chat.lastMessage?._id === message._id
                                ? message
                                : chat.lastMessage,
                          };
                        }
                        return chat;
                      }),
                    }));
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
