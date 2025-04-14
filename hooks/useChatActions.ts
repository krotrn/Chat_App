import { useTransition, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  sendMessage,
  deleteMessage,
  updateReaction,
  editMessage,
  markMessagesAsRead,
} from "@/services/chat-api";
import { MessageType } from "@/types/ChatType";

export default function useChatActions(
  chatId: string,
  replyToMessage: MessageType | null,
  setReplyToMessage: React.Dispatch<React.SetStateAction<MessageType | null>>,
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>,
  currentUserId?: string
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
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
          if (replyToMessage?._id === messageId) setReplyToMessage(null);
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
          const updatedMessage = await updateReaction({
            chatId,
            messageId,
            emoji,
          });
          setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? updatedMessage : msg))
          );
        } catch (error) {
          console.error(error);
          toast.error("Failed to update reaction");
        }
      });
    },
    [chatId, setMessages]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, content: string) => {
      startTransition(async () => {
        try {
          const updatedMessage = await editMessage({
            chatId,
            messageId,
            content,
          });
          setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? updatedMessage : msg))
          );
          toast.success("Message edited successfully");
        } catch (error) {
          console.error(error);
          toast.error("Failed to edit message");
        }
      });
    },
    [chatId, setMessages]
  );

  const handleMarkAsRead = useCallback(
    async (messageIds?: string[]) => {
      if (!currentUserId) return;
      
      startTransition(async () => {
        const readAt = new Date();
        
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) => {
            if (
              (!messageIds || messageIds.includes(msg._id)) && 
              msg.sender !== currentUserId && 
              (!msg.readBy || !msg.readBy.some(r => r.userId === currentUserId))
            ) {
              return {
                ...msg,
                readBy: [
                  ...(msg.readBy || []),
                  { userId: currentUserId, readAt }
                ]
              };
            }
            return msg;
          });
          return updatedMessages;
        });
        
        try {
          await markMessagesAsRead({
            chatId,
            messageIds,
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
          
          if (error instanceof Error && error.message.includes('network')) {
            toast.error("Network issue - read status may not sync", {
              duration: 3000,
              position: 'bottom-right'
            });
          }
        }
      });
    },
    [chatId, currentUserId, setMessages]
  );

  useEffect(() => {
    if (chatId && currentUserId) {
      handleMarkAsRead();
    }
  }, [chatId, currentUserId, handleMarkAsRead]);

  return {
    handleDeleteMessage,
    handleReactToMessage,
    handleSendMessage,
    handleEditMessage,
    handleMarkAsRead,
    isLoading,
  };
}
