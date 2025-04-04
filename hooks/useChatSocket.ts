import { useEffect, useState } from "react";
import { initSocket, joinChat } from "@/lib/socket";
import { ChatEventEnum } from "@/lib/socket-event";
import { Message } from "@/types/ChatType";

export default function useChatSocket(
  initialChatId: string,
  currentUserId: string,
  initialMessages: Message[]
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    if (!currentUserId || !initialChatId) return;
    const socket = initSocket(currentUserId);
    joinChat(initialChatId);

    socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, (message: Message) => {
      if (message.chatId === initialChatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on(ChatEventEnum.MESSAGE_REACTION_EVENT, (updated: Message) => {
      if (updated.chatId === initialChatId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === updated.id ? updated : msg))
        );
      }
    });

    socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (deleted: Message) => {
      if (deleted?.chatId === initialChatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== deleted.id));
      }
    });

    return () => {
      socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT);
      socket.off(ChatEventEnum.MESSAGE_REACTION_EVENT);
      socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT);
    };
  }, [initialChatId, currentUserId]);

  return { messages, setMessages };
}
