import { useTransition, useCallback } from "react";
import { toast } from "sonner";
import {
  sendMessage,
  deleteMessage,
  updateReaction,
} from "@/services/chat-api";
import { Message } from "@/types/ChatType";

export default function useChatActions(
  chatId: string,
  replyToMessage: Message | null,
  setReplyToMessage: React.Dispatch<React.SetStateAction<Message | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [isLoading, startTransition] = useTransition();

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyToId?: string) => {
      startTransition(async () => {
        try {
          await sendMessage({ chatId, content, attachments, replyToId });
        } catch (error) {
          console.error(error);
          toast.error("Failed to send message");
        }
      });
    },
    [chatId]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      void forEveryone;
      startTransition(async () => {
        try {
          await deleteMessage({ chatId, messageId });
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          if (replyToMessage?.id === messageId) setReplyToMessage(null);
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete message");
        }
      });
    },
    [chatId, replyToMessage, setReplyToMessage, setMessages]
  );

  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      startTransition(async () => {
        try {
          const updatedMessage = await updateReaction({ chatId, messageId, emoji });
          setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
          );
        } catch (error) {
          console.error(error);
          toast.error("Failed to update reaction");
        }
      });
    },
    [chatId, setMessages]
  );

  return { handleSendMessage, handleDeleteMessage, handleReactToMessage, isLoading };
}
