import type { Middleware } from "@reduxjs/toolkit";
import {
  CONNECT_SOCKET,
  ConnectSocketPayload,
  DISCONNECT_SOCKET,
} from "@/lib/redux/chatSocketActions";
import {
  setConnectionState,
  clearChatState,
  setCurrentChat,
} from "@/lib/redux/slices/chat-slice";
import {
  ConnectionState,
  MessageType,
  ChatType,
  MessagesPageData,
} from "@/types/ChatType";
import { initSocket, joinChat, getSocket, setSocket, leaveChat } from "@/lib/socket";
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
          const currentChat = store.getState().chat.currentChat;
          if (existingSocket) {
            if (currentChat._id === chat._id) {
              console.log("already connected to this chat");
              return;
            }
            leaveChat(currentChat._id);
            console.log(`Left chat room ${currentChat._id}`);
          }
          if (!existingSocket) {
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
                if (queryClient) {
                  queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                    queryKeys.messages.infinite(message.chatId, 20),
                    (old) => {
                      if (!old) return old;

                      const realMessageExists = old.pages.some((page) =>
                        page.messages.some(
                          (msg: MessageType) => msg._id === message._id
                        )
                      );

                      if (realMessageExists) {
                        return old;
                      }

                      let hasOptimisticMessage = false;
                      const newPages = old.pages.map((page) => ({
                        ...page,
                        messages: page.messages.map((msg) => {
                        
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
                            return message;
                          }
                          return msg;
                        }),
                      }));

                      if (hasOptimisticMessage) {
                        return { ...old, pages: newPages };
                      } else {
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
                  queryClient.setQueryData<InfiniteData<{ chats: ChatType[]; }>>(
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
              (data: { chatId: string; messageId: string; }) => {
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
              (data: { chatId: string; messageId: string; }) => {
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
              (data: { chatId: string; messageId: string; }) => {
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
                  queryClient.setQueryData<InfiniteData<{ chats: ChatType[]; }>>(
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
                  queryClient.setQueryData<InfiniteData<{ chats: ChatType[]; }>>(
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
              if (queryClient) {
                queryClient.setQueryData(queryKeys.chats.detail(chat._id), chat);
                queryClient.setQueryData<InfiniteData<{ chats: ChatType[]; }>>(
                  queryKeys.chats.infinite(20),
                  (old) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      chats: [chat, ...page.chats],
                    }));
                    return { ...old, pages: newPages };
                  }
                );
              }
            });
            socket.on(ChatEventEnum.CHAT_UPDATED_EVENT, (chat: ChatType) => {
              if (queryClient) {
                queryClient.setQueryData(queryKeys.chats.detail(chat._id), chat);
                queryClient.setQueryData<InfiniteData<{ chats: ChatType[]; }>>(
                  queryKeys.chats.infinite(20),
                  (old) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      chats: page.chats.map((c) =>
                        c._id === chat._id ? chat : c
                      ),
                    }));
                    return { ...old, pages: newPages };
                  }
                );
              }
            });
            socket.on(ChatEventEnum.CHAT_DELETED_EVENT, (chat: ChatType) => {
              if (queryClient) {
                queryClient.removeQueries({
                  queryKey: queryKeys.chats.detail(chat._id),
                });
                queryClient.setQueryData<InfiniteData<{ chats: ChatType[]; }>>(
                  queryKeys.chats.infinite(20),
                  (old) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page) => ({
                      ...page,
                      chats: page.chats.filter((c) => c._id !== chat._id),
                    }));
                    return { ...old, pages: newPages };
                  }
                );
              }
            });
            socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, () => {
              store.dispatch(setConnectionState(ConnectionState.FAILED));
            });
            socket.on("disconnect", () => {
              store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
            });
          } else {
                        store.dispatch(clearChatState());
            store.dispatch(setCurrentChat(chat));
            store.dispatch(setConnectionState(ConnectionState.CONNECTING));
            joinChat(chat._id);

            store.dispatch(setConnectionState(ConnectionState.CONNECTED));

          }
          break;
        }
        case DISCONNECT_SOCKET: {
          console.log("disconnected");
          const existingSocket = getSocket();
          if (existingSocket) {
            existingSocket.removeAllListeners();
            existingSocket.disconnect();
          }
        }
      }
    }
    return next(action);
  };
