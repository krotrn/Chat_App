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
  const socketRef = useRef<ReturnType<typeof initSocket> | null>(null);

  useEffect(() => {
    if (!currentUserId || !initialChatId || !token) return;

    try {
      socketRef.current = initSocket(token);
      joinChat(initialChatId);

      const socket = socketRef.current;

      socket.on(
        ChatEventEnum.MESSAGE_RECEIVED_EVENT,
        (message: MessageType) => {
          if (message.chatId === initialChatId) {
            setMessages((prev) => [...prev, message]);
          }
        },
      );

      socket.on(
        ChatEventEnum.MESSAGE_REACTION_EVENT,
        (updated: MessageType) => {
          if (updated.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((msg) => (msg._id === updated._id ? updated : msg)),
            );
          }
        },
      );

      // Handle deleted messages
      socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (deleted: MessageType) => {
        if (deleted?.chatId === initialChatId) {
          setMessages((prev) => prev.filter((msg) => msg._id !== deleted._id));
        }
      });

      // Handle edited messages
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

      // Handle read receipts
      socket.on(
        ChatEventEnum.MESSAGE_READ_EVENT,
        (data: {
          chatId: string;
          readBy: { userId: string; readAt: Date | string };
          messageIds: string[];
        }) => {
          if (data.chatId === initialChatId) {
            setMessages((prev) =>
              prev.map((msg) => {
                if (data.messageIds.includes(msg._id)) {
                  const readBy = msg.readBy || [];
                  // Check if this user already has a read receipt
                  const existingReadIndex = readBy.findIndex(
                    (read) => read.userId === data.readBy.userId,
                  );

                  if (existingReadIndex >= 0) {
                    // Update existing read receipt
                    return msg;
                  } else {
                    // Add new read receipt
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

      // Handle connection error
      socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, (error: Error) => {
        console.error("Socket connection error:", error);
        toast.error("Chat connection failed. Please refresh the page.", {
          duration: 5000,
        });
      });

      return () => {
        socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT);
        socket.off(ChatEventEnum.MESSAGE_REACTION_EVENT);
        socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT);
        socket.off(ChatEventEnum.MESSAGE_EDITED_EVENT);
        socket.off(ChatEventEnum.MESSAGE_READ_EVENT);
        socket.off(ChatEventEnum.SOCKET_ERROR_EVENT);
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
      toast.error("Failed to connect to chat service", {
        duration: 5000,
      });
    }
  }, [initialChatId, currentUserId, token]);

  return { messages, setMessages };
}
