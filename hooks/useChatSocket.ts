"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { initSocket, joinChat } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { ChatType, ConnectionState, MessageType } from "@/types/ChatType";
import { toast } from "sonner";

export default function useChatSocket(
  initialChatId: string,
  currentUserId: string,
  token: string
) {
  /**
   * For storing chats.
   */
  const [chats, setChats] = useState<ChatType[]>([]);
  /**
   * For storing messages.
   */
  const [messages, setMessages] = useState<MessageType[]>([]);
  /**
   * For storing pinned message ids.
   */
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  /**
   * For storing socket connection state.
   */
  const socketRef = useRef<SocketIOClient.Socket | null>(null);
  /**
   * For storing socket connection state.
   */
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED
  );
  /**
   * For storing the number of reconnect attempts.
   */
  const reconnectAttempts = useRef(0);
  /**
   * For storing the maximum number of reconnect attempts.
   */
  const maxReconnectAttempts = 5;
  /**
   * For storing the reconnect timer.
   */
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * For Updating multiple messages in the state.
   * @param messageIds - The ids of the messages to update.
   * @param updateFn - The function to update the message.
   * @returns void
   */
  const updateMultipleMessages = useCallback(
    (messageIds: string[], updateFn: (msg: MessageType) => MessageType) => {
      setMessages((prev) => {
        const needsUpdate = prev.some((msg) => messageIds.includes(msg._id));
        if (!needsUpdate) return prev;

        return prev.map((msg) =>
          messageIds.includes(msg._id) ? updateFn(msg) : msg
        );
      });
    },
    []
  );

  /**
   * update chat when a new message is received.
   */
  const onChatUpdate = useCallback((newMessage: MessageType) => {
    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex(
        (chat) => chat._id === newMessage.chatId
      );

      if (chatIndex === -1) {
        console.warn(`Chat ${newMessage.chatId} not found for socket update.`);
        return prevChats;
      }

      const updatedChats = [...prevChats];
      const targetChat = { ...updatedChats[chatIndex] };

      // Update last message
      if (updatedChats[chatIndex].lastMessage?._id === newMessage._id) {
        targetChat.lastMessage = newMessage;
      }

      if (!targetChat.messages.some((msg) => msg._id === newMessage._id)) {
        targetChat.messages = [...targetChat.messages, newMessage];
      }

      updatedChats[chatIndex] = targetChat;

      return updatedChats;
    });
  }, []);

  /**
   * For Cleaning the Timer.
   */
  const cleanupTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearInterval(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  /**
   * For connecting to soocket
   */
  useEffect(() => {
    if (!currentUserId || !initialChatId || !token) return;

    try {
      console.log("Initializing socket connection for chat:", initialChatId);
      setConnectionState(ConnectionState.CONNECTING);
      socketRef.current = initSocket(token);
      console.log("Socket already initialized, joining chat:", initialChatId);
      joinChat(initialChatId);

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Socket connected!");
        setConnectionState(ConnectionState.CONNECTED);
        reconnectAttempts.current = 0;
        cleanupTimer();
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected!");
        setConnectionState(ConnectionState.RECONNECTING);
        cleanupTimer();
        reconnectTimerRef.current = setInterval(
          () => {
            if (reconnectAttempts.current >= maxReconnectAttempts) {
              cleanupTimer();
              setConnectionState(ConnectionState.DISCONNECTED);
              toast.error("Failed to reconnect. Please refresh the page.");
              return;
            }
            reconnectAttempts.current++;
            console.log(
              `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`
            );
            socket.connect();
          },
          3000 * Math.min(reconnectAttempts.current, 3)
        );
      });

      socket.on(
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        (message: MessageType) => {
          console.log(message)
          if (message.chatId === initialChatId) {
            setMessages((prev) => {
              const serverIdIndex = prev.findIndex(
                (msg) => msg._id === message._id
              );
              if (serverIdIndex >= 0) {
                const updatedMessages = [...prev];
                updatedMessages[serverIdIndex] = message;
                return updatedMessages;
              }
              return [...prev, message];
            });
          }
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === message.chatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
            )
          );
          onChatUpdate(message);
        }
      );

      socket.on(
        ChatEventEnum.MESSAGE_REACTION_EVENT,
        (updated: MessageType) => {
          console.log(updated)
          console.log("Message reaction received:", updated);
          if (updated.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((message) =>
                message._id === updated._id ? updated : message
              )
            );
          }
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === updated.chatId
                ? {
                    ...chat,
                    messages: chat.messages.map((msg) =>
                      msg._id === updated._id ? updated : msg
                    ),
                  }
                : chat
            )
          );
          onChatUpdate(updated);
        }
      );

      socket.on(
        ChatEventEnum.MESSAGE_PINNED_EVENT,
        (data: { chatId: string; messageId: string }) => {
          console.log("Message pinned event received:", data);
          if (data.chatId === initialChatId) {
            setPinnedMessageIds((prev) => {
              return prev.includes(data.messageId)
                ? prev
                : [...prev, data.messageId];
            });

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg._id === data.messageId) {
                  return {
                    ...msg,
                    isPinned: true,
                  };
                }
                return msg;
              })
            );
            setChats((prev) =>
              prev.map((chat) =>
                chat._id === data.chatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg) =>
                        msg._id === data.messageId
                          ? { ...msg, isPinned: true }
                          : msg
                      ),
                    }
                  : chat
              )
            );
          }
        }
      );

      socket.on(
        ChatEventEnum.MESSAGE_UNPINNED_EVENT,
        (data: { chatId: string; messageId: string }) => {
          console.log("Message unpinned event received:", data);
          if (data.chatId === initialChatId) {
            setPinnedMessageIds((prev) => {
              return prev.filter((id) => id !== data.messageId);
            });

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg._id === data.messageId) {
                  return {
                    ...msg,
                    isPinned: false,
                  };
                }
                return msg;
              })
            );
            setChats((prev) =>
              prev.map((chat) =>
                chat._id === data.chatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg) =>
                        msg._id === data.messageId
                          ? { ...msg, isPinned: false }
                          : msg
                      ),
                    }
                  : chat
              )
            );
          }
        }
      );

      socket.on(
        ChatEventEnum.MESSAGE_DELETE_EVENT,
        (data: { chatId: string; messageId: string; deletedBy: string; }) => {
          console.log(data)
          if (data.chatId === initialChatId) {
            setMessages((prev) =>
              prev.filter((msg) => msg._id !== data.messageId)
            );

            setPinnedMessageIds((prev) =>
              prev.filter((id) => id !== data.messageId)
            );
          }
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === data.chatId
                ? {
                    ...chat,
                    messages: chat.messages.filter(
                      (msg) => msg._id !== data.messageId
                    ),
                  }
                : chat
            )
          );
        }
      );

      socket.on(ChatEventEnum.MESSAGE_EDITED_EVENT, (data: MessageType) => {
        console.log("Message edited event received:", data);
        if (data.chatId === initialChatId) {
          setMessages((prev) =>
            prev.map((msg) => (msg._id === data._id ? data : msg))
          );
        }
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === data.chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === data._id ? data : msg
                  ),
                }
              : chat
          )
        );
      });

      socket.on(
        ChatEventEnum.MESSAGE_READ_EVENT,
        (data: {
          chatId: string;
          readBy: { userId: string; readAt: Date | string };
          messageIds: string[];
        }) => {
          console.log("Message read event received:", data);
          if (data.chatId === initialChatId && data.messageIds.length > 0) {
            const readAt =
              data.readBy.readAt instanceof Date
                ? data.readBy.readAt
                : new Date(data.readBy.readAt);
            updateMultipleMessages(data.messageIds, (message) => {
              const readBy = message.readBy;
              const existingReadIndex = readBy.findIndex(
                (read) => read.userId === data.readBy.userId
              );
              if (existingReadIndex >= 0) {
                return message;
              } else {
                return {
                  ...message,
                  readBy: [
                    ...readBy,
                    {
                      userId: data.readBy.userId,
                      readAt,
                    },
                  ],
                };
              }
            });
          }
        }
      );

      socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, (error: Error) => {
        console.error("Socket connection error:", error);
        setConnectionState(ConnectionState.DISCONNECTED);
        toast.error("Chat connection failed. Please refresh the page.", {
          duration: 5000,
        });
      });

      socket.on(ChatEventEnum.NEW_CHAT_EVENT, (data: ChatType) => {
        setChats((prevChats) => {
          console.log(data)
          if (prevChats.some((chat) => chat._id === data._id)) {
            return prevChats;
          }
          return [...prevChats, data];
        });
      });

      socket.on(ChatEventEnum.CHAT_UPDATED_EVENT, (data: ChatType) => {
        console.log(data)
        setChats((prev) =>
          prev.map((chat) => (chat._id === data._id ? data : chat))
        );
      });
      socket.on(ChatEventEnum.CHAT_DELETED_EVENT, (data: ChatType) => {
        console.log(data)
        setChats((prev) => prev.filter((chat) => chat._id !== data._id));
      });
      socket.on(ChatEventEnum.REMOVED_FROM_CHAT, (data: ChatType) => {
        console.log(data)
        setChats((prev) => prev.filter((chat) => chat._id !== data._id));
      });

      const cleanup = () => {
        console.log("Cleaning up socket connection");
        cleanupTimer();
        if (socketRef.current) {
          const socket = socketRef.current;
          socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT);
          socket.off(ChatEventEnum.MESSAGE_REACTION_EVENT);
          socket.off(ChatEventEnum.MESSAGE_PINNED_EVENT);
          socket.off(ChatEventEnum.MESSAGE_UNPINNED_EVENT);
          socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT);
          socket.off(ChatEventEnum.MESSAGE_EDITED_EVENT);
          socket.off(ChatEventEnum.MESSAGE_READ_EVENT);
          socket.off(ChatEventEnum.SOCKET_ERROR_EVENT);
          socket.off("connect");
          socket.off("disconnect");
          socket.disconnect();
          socketRef.current = null;
        }
      };

      return cleanup;
    } catch (error) {
      console.error("Socket initialization error:", error);
      setConnectionState(ConnectionState.DISCONNECTED);
      toast.error("Failed to connect to chat service", {
        duration: 5000,
      });
    }
  }, [
    initialChatId,
    currentUserId,
    token,
    cleanupTimer,
    updateMultipleMessages,
    onChatUpdate,
  ]);

  return {
    messages,
    setMessages,
    pinnedMessageIds,
    isConnected: connectionState === ConnectionState.CONNECTED,
    connectionState,
    chats,
    setChats,
  };
}
