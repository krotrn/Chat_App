import type { Middleware } from "@reduxjs/toolkit";
import {
  INITIALIZE_SOCKET,
  InitializeSocketPayload,
  JOIN_CHAT_ROOM,
  JoinChatPayload,
  LEAVE_CHAT_ROOM,
  TERMINATE_SOCKET,
} from "@/lib/redux/chatSocketActions";
import {
  setConnectionState,
  setonlineUserIds,
  setTypingUserIds,
} from "@/lib/redux/slices/chat-slice";
import {
  ConnectionState,
  MessageType,
  ChatType,
  MessagesPageData,
} from "@/types/ChatType";
import { initSocket, getSocket, setSocket } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/config";

let queryClient: QueryClient | null = null;
export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

export const chatSocketMiddleware: Middleware =
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
          existingSocket.disconnect();
          setSocket(null);
        }

        const { token } = (
          action as unknown as { payload: InitializeSocketPayload }
        ).payload;
        const socket = initSocket(token);
        setSocket(socket);
        store.dispatch(setConnectionState(ConnectionState.CONNECTING));
        socket.on("connect", () => {
          store.dispatch(setConnectionState(ConnectionState.CONNECTED));
          setTimeout(() => {
            socket.emit(ChatEventEnum.USER_ONLINE_EVENT);
            console.log("Socket connected successfully and user is online");
          }, 100);
        });

        socket.on(
          ChatEventEnum.ONLINE_USERS_LIST_EVENT,
          (data: { onlineUserIds: string[] }) => {
            console.log(
              "Received initial online users list:",
              data.onlineUserIds
            );
            store.dispatch(setonlineUserIds(data.onlineUserIds));
          }
        );

        socket.on(
          ChatEventEnum.TYPING_EVENT,
          (data: { userId: string; chatId: string }) => {
            const typingUserIds = store.getState().chat.typingUserIds;
            if (
              !typingUserIds.some(
                (u: { userId: string; chatId: string }) =>
                  u.userId === data.userId && u.chatId === data.chatId
              )
            ) {
              store.dispatch(setTypingUserIds([...typingUserIds, data]));

              setTimeout(() => {
                const currentTypingUserIds =
                  store.getState().chat.typingUserIds;
                const cleanedTypingUserIds = currentTypingUserIds.filter(
                  (u: { userId: string; chatId: string }) =>
                    !(u.userId === data.userId && u.chatId === data.chatId)
                );
                if (
                  cleanedTypingUserIds.length !== currentTypingUserIds.length
                ) {
                  store.dispatch(setTypingUserIds(cleanedTypingUserIds));
                }
              }, 5000);
            }
          }
        );

        socket.on(
          ChatEventEnum.STOP_TYPING_EVENT,
          (data: { userId: string; chatId: string }) => {
            const typingUserIds = store.getState().chat.typingUserIds;
            const updatedTypingUserIds = typingUserIds.filter(
              (u: { userId: string; chatId: string }) =>
                !(u.userId === data.userId && u.chatId === data.chatId)
            );
            store.dispatch(setTypingUserIds(updatedTypingUserIds));
          }
        );

        socket.on(
          ChatEventEnum.USER_IS_OFFLINE_EVENT,
          (data: { userId: string }) => {
            console.log(`User ${data.userId} is offline`);
            const onlineUserIds = store.getState().chat.onlineUserIds;
            store.dispatch(
              setonlineUserIds(
                onlineUserIds.filter((id: string) => id !== data.userId)
              )
            );
          }
        );
        socket.on(
          ChatEventEnum.USER_IS_ONLINE_EVENT,
          (data: { userId: string }) => {
            console.log(`User ${data.userId} is online`);
            const onlineUserIds: string[] = store.getState().chat.onlineUserIds;
            store.dispatch(setonlineUserIds([...onlineUserIds, data.userId]));
          }
        );

        socket.on("connect_error", (error: Error) => {
          console.error("Socket connection error:", error);
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
            socket.emit(ChatEventEnum.USER_ONLINE_EVENT);
            console.log("User marked as online after reconnection");

            const currentChat = store.getState().chat.currentChat;
            if (currentChat) {
              console.log(
                `Rejoining chat ${currentChat._id} after reconnection`
              );
              socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, currentChat._id);
            }

            if (queryClient) {
              queryClient.invalidateQueries({
                queryKey: queryKeys.chats.infinite(20),
              });
            }
          }, 500);
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
        socket.on(
          ChatEventEnum.MESSAGE_READ_EVENT,
          (data: {
            chatId: string;
            messageIds: string[];
            readBy: { userId: string; readAt: string };
          }) => {
            if (queryClient) {
              queryClient.setQueryData<InfiniteData<MessagesPageData>>(
                queryKeys.messages.infinite(data.chatId, 20),
                (old) => {
                  if (!old) return old;

                  const newPages = old.pages.map((page) => ({
                    ...page,
                    messages: page.messages.map((msg: MessageType) => {
                      if (data.messageIds.includes(msg._id)) {
                        const existingReadBy = msg.readBy || [];
                        const isAlreadyRead = existingReadBy.some(
                          (read) => read.userId === data.readBy.userId
                        );

                        if (isAlreadyRead) {
                          return msg;
                        }
                        const readByEntry = {
                          userId: data.readBy.userId,
                          readAt: new Date(data.readBy.readAt),
                        };

                        return {
                          ...msg,
                          readBy: [...existingReadBy, readByEntry],
                        };
                      }
                      return msg;
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
            queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
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
            queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
              queryKeys.chats.infinite(20),
              (old) => {
                if (!old) return old;
                const newPages = old.pages.map((page) => ({
                  ...page,
                  chats: page.chats.map((c) => (c._id === chat._id ? chat : c)),
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
            queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
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

        break;
      }
      case JOIN_CHAT_ROOM: {
        const socket = getSocket();
        if (socket?.connected) {
          const { chatId } = (action as unknown as { payload: JoinChatPayload })
            .payload;
          socket.emit(ChatEventEnum.JOIN_CHAT_EVENT, chatId);
        }
        break;
      }
      case LEAVE_CHAT_ROOM: {
        const socket = getSocket();
        if (socket?.connected) {
          const { chatId } = (action as unknown as { payload: JoinChatPayload })
            .payload;
          socket.emit(ChatEventEnum.LEAVE_CHAT_EVENT, chatId);
        }
        break;
      }
      case TERMINATE_SOCKET: {
        const socket = getSocket();
        if (socket) {
          socket.disconnect();
          setSocket(null);
          store.dispatch(setConnectionState(ConnectionState.DISCONNECTED));
        }
        break;
      }
    }
    next(action);
  };
