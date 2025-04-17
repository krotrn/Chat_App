import { useEffect, useRef, useState } from "react";
import { initSocket, joinChat } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { MessageType } from "@/types/ChatType";
import { toast } from "sonner";

export default function useChatSocket(
  initialChatId: string,
  currentUserId: string,
  token: string,
  initialMessages: MessageType[],
) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  const socketRef = useRef<ReturnType<typeof initSocket> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!currentUserId || !initialChatId || !token) return;

    try {
      console.log("Initializing socket connection for chat:", initialChatId);
      socketRef.current = initSocket(token);
      joinChat(initialChatId);

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Socket connected!");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected!");
        setIsConnected(false);
      });

      socket.on(
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        (message: MessageType) => {
          console.log("Message received via socket:", message);
          if (message.chatId === initialChatId) {
            setMessages((prev) => {
              const exists = prev.some((msg) => msg._id === message._id);
              if (exists) {
                return prev.map((msg) =>
                  msg._id === message._id ? message : msg,
                );
              }
              return [...prev, message];
            });
          }
        },
      );

      socket.on(
        ChatEventEnum.MESSAGE_REACTION_EVENT,
        (updated: MessageType) => {
          console.log("Message reaction received:", updated);
          if (updated.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((msg) => (msg._id === updated._id ? updated : msg)),
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
          console.log("Message edit event received:", data);
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
          if (data.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((msg) => {
                if (data.messageIds.includes(msg._id)) {
                  const readBy = msg.readBy || [];
                  const existingReadIndex = readBy.findIndex(
                    (read) => read.userId === data.readBy.userId,
                  );

                  if (existingReadIndex >= 0) {
                    return msg;
                  } else {
                    const readAt =
                      data.readBy.readAt instanceof Date
                        ? data.readBy.readAt
                        : new Date(data.readBy.readAt);

                    return {
                      ...msg,
                      readBy: [
                        ...readBy,
                        {
                          userId: data.readBy.userId,
                          readAt,
                        },
                      ],
                    };
                  }
                }
                return msg;
              }),
            );
          }
        },
      );

      socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, (error: Error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        toast.error("Chat connection failed. Please refresh the page.", {
          duration: 5000,
        });
      });

      return () => {
        console.log("Cleaning up socket connection");
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
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
      setIsConnected(false);
      toast.error("Failed to connect to chat service", {
        duration: 5000,
      });
    }
  }, [initialChatId, currentUserId, token]);

  return { messages, setMessages, pinnedMessageIds, isConnected };
}
