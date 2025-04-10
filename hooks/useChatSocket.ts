import { useEffect, useState } from "react";
import { initSocket, joinChat } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { MessageType } from "@/types/ChatType";

export default function useChatSocket(
  initialChatId: string,
  currentUserId: string,
  token: string,
  initialMessages: MessageType[]
) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  useEffect(() => {
    if (!currentUserId || !initialChatId) return;
    const socket = initSocket(token);
    joinChat(initialChatId);

    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, (message: MessageType) => {
      if (message.chatId === initialChatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on(ChatEventEnum.MESSAGE_REACTION_EVENT, (updated: MessageType) => {
      if (updated.chatId === initialChatId) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === updated._id ? updated : msg))
        );
      }
    });

    socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (deleted: MessageType) => {
      if (deleted?.chatId === initialChatId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== deleted._id));
      }
    });

    return () => {
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT);
      socket.off(ChatEventEnum.MESSAGE_REACTION_EVENT);
      socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT);
    };
  }, [initialChatId, currentUserId, token]);

  return { messages, setMessages };
}
