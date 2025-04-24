"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { initSocket, joinChat } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { ConnectionState, MessageType } from "@/types/ChatType";
import { toast } from "sonner";

export default function useChatSocket(
  initialChatId: string,
  currentUserId: string,
  token: string,
  onChatUpdate: (message: MessageType) => void,
) {
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
    ConnectionState.DISCONNECTED,
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
          messageIds.includes(msg._id) ? updateFn(msg) : msg,
        );
      });
    },
    [],
  );

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
        toast.success("Connected to chat server", {
          duration: 3000,
        });
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
              `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`,
            );
            socket.connect();
          },
          3000 * Math.min(reconnectAttempts.current, 3),
        );
      });

      socket.on(
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        (message: MessageType) => {
          if (message.chatId === initialChatId) {
            setMessages((prev) => {
              const serverIdIndex = prev.findIndex(
                (msg) => msg._id === message._id,
              );
              if (serverIdIndex >= 0) {
                console.log(
                  `Updating existing message ${message._id} from socket event.`,
                );
                const updatedMessages = [...prev];
                updatedMessages[serverIdIndex] = message;
                return updatedMessages;
              }

              if (message.sender.userId === currentUserId) {
                const tempIndex = prev.findIndex(
                  (msg) =>
                    msg._id.startsWith("temp-") &&
                    msg.sender.userId === currentUserId &&
                    (msg.content === message.content ||
                      Math.abs(
                        new Date(msg.createdAt).getTime() -
                          new Date(message.createdAt).getTime(),
                      ) < 10000),
                );

                if (tempIndex >= 0) {
                  console.log(
                    `Replacing message match with ${message._id} from socket event.`,
                  );
                  const updatedMessages = [...prev];
                  updatedMessages[tempIndex] = message;
                  return updatedMessages;
                }
              }

              console.log(
                `Adding new message ${message._id} from socket event.`,
              );
              return [...prev, message];
            });
          }
          onChatUpdate(message);
        },
      );

      socket.on(
        ChatEventEnum.MESSAGE_REACTION_EVENT,
        (updated: MessageType) => {
          console.log("Message reaction received:", updated);
          if (updated.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((message) =>
                message._id === updated._id ? updated : message,
              ),
            );
          }
        },
      );

      socket.on(
        ChatEventEnum.MESSAGE_PIN_EVENT,
        (data: { chatId: string; messageId: string; isPinned: boolean }) => {
          console.log("Message pin event received:", data);
          if (data.chatId === initialChatId) {
            setPinnedMessageIds((prev) => {
              if (data.isPinned) {
                return prev.includes(data.messageId)
                  ? prev
                  : [...prev, data.messageId];
              } else {
                return prev.filter((id) => id !== data.messageId);
              }
            });

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg._id === data.messageId) {
                  return {
                    ...msg,
                    isPinned: data.isPinned,
                  };
                }
                return msg;
              }),
            );
          }
        },
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
              }),
            );
          }
        },
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
              }),
            );
          }
        },
      );

      socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (deleted: MessageType) => {
        console.log("Message delete event received:", deleted);
        if (deleted?.chatId === initialChatId) {
          setMessages((prev) => prev.filter((msg) => msg._id !== deleted._id));

          setPinnedMessageIds((prev) =>
            prev.filter((id) => id !== deleted._id),
          );
        }
      });

      socket.on(
        ChatEventEnum.MESSAGE_EDITED_EVENT,
        (data: {
          messageId: string;
          content: string;
          chatId: string;
          editedAt?: Date | string;
        }) => {
          if (data.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg._id === data.messageId) {
                  return {
                    ...msg,
                    content: data.content,
                    edited: {
                      ...msg.edited,
                      isEdited: true,
                      editedAt: data.editedAt
                        ? new Date(data.editedAt)
                        : new Date(),
                    },
                  };
                }
                return msg;
              }),
            );
          }
        },
      );

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
                (read) => read.userId === data.readBy.userId,
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
        },
      );

      socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, (error: Error) => {
        console.error("Socket connection error:", error);
        setConnectionState(ConnectionState.DISCONNECTED);
        toast.error("Chat connection failed. Please refresh the page.", {
          duration: 5000,
        });
      });

      const cleanup = () => {
        console.log("Cleaning up socket connection");
        cleanupTimer();
        if (socketRef.current) {
          const socket = socketRef.current;
          socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT);
          socket.off(ChatEventEnum.MESSAGE_REACTION_EVENT);
          socket.off(ChatEventEnum.MESSAGE_PIN_EVENT);
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
  };
}
