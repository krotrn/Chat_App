import { useTransition, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  sendMessage,
  deleteMessage,
  updateReaction,
  editMessage,
  markMessagesAsRead,
} from "@/services/chat-api";
import { MessageType } from "@/types/ChatType";

interface ChatActionsProps {
  chatId: string;
  replyToMessage: MessageType | null;
  setReplyToMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUserId?: string;
}

export default function useChatActions({
  chatId,
  replyToMessage,
  setReplyToMessage,
  setMessages,
  currentUserId
}: ChatActionsProps) {
  const [isLoading, startTransition] = useTransition();
  const pendingReadMessages = useRef<Set<string>>(new Set());

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyToId?: string) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        toast.error("Message cannot be empty");
        return;
      }

      startTransition(async () => {
        try {
          await sendMessage({ chatId, content, attachments, replyToId });
          
          // Clear reply if it was used
          if (replyToId && replyToMessage?._id === replyToId) {
            setReplyToMessage(null);
          }
        } catch (error) {
          console.error("Failed to send message:", error);
          toast.error(
            error instanceof Error && error.message 
              ? error.message 
              : "Failed to send message"
          );
        }
      });
    },
    [chatId, replyToMessage, setReplyToMessage]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      startTransition(async () => {
        try {
          await deleteMessage({ 
            chatId, 
            messageId,
            forEveryone
          });
          
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
          
          if (replyToMessage?._id === messageId) {
            setReplyToMessage(null);
          }
          
          toast.success("Message deleted successfully");
        } catch (error) {
          console.error("Delete message error:", error);
          toast.error(
            error instanceof Error && error.message 
              ? error.message 
              : "Failed to delete message"
          );
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
          console.error("Reaction update error:", error);
          toast.error(
            error instanceof Error && error.message 
              ? error.message 
              : "Failed to update reaction"
          );
        }
      });
    },
    [chatId, setMessages]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!content.trim()) {
        toast.error("Message cannot be empty");
        return;
      }
      
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
          console.error("Edit message error:", error);
          toast.error(
            error instanceof Error && error.message 
              ? error.message 
              : "Failed to edit message"
          );
        }
      });
    },
    [chatId, setMessages]
  );

  const handleMarkAsRead = useCallback(
    async (messageIds?: string[]) => {
      if (!currentUserId || !chatId) return;
      
      // Optimistically update UI
      const readAt = new Date();
      const messagesToMark = new Set<string>();
      
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) => {
          if (
            (!messageIds || messageIds.includes(msg._id)) && 
            msg.sender.userId !== currentUserId && 
            (!msg.readBy || !msg.readBy.some(r => r.userId === currentUserId))
          ) {
            // Add to the set of messages to mark as read
            messagesToMark.add(msg._id);
            
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
      
      // Add messages to pending set
      messageIds?.forEach(id => pendingReadMessages.current.add(id));
      
      // Debounced API call
      const idsToMark = messageIds || Array.from(messagesToMark);
      if (idsToMark.length === 0) return;
      
      try {
        await markMessagesAsRead({
          chatId,
          messageIds: idsToMark,
        });
        
        // Remove from pending set after success
        idsToMark.forEach(id => pendingReadMessages.current.delete(id));
      } catch (error) {
        console.error("Error marking messages as read:", error);
        
        if (error instanceof Error && error.message.includes('network')) {
          toast.error("Network issue - read status may not sync", {
            duration: 3000,
            position: 'bottom-right'
          });
        }
      }
    },
    [chatId, currentUserId, setMessages]
  );

  // Mark messages as read on mount and chat ID change
  useEffect(() => {
    if (chatId && currentUserId) {
      handleMarkAsRead();
    }
    
    // Capture the current values before cleanup
    const currentChatId = chatId;
    const pendingMessages = pendingReadMessages.current;
    
    // Cleanup: attempt to send any pending read statuses
    return () => {
      if (pendingMessages.size > 0 && currentChatId) {
        markMessagesAsRead({
          chatId: currentChatId,
          messageIds: Array.from(pendingMessages),
        }).catch(console.error);
      }
    };
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
