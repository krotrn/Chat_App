import { startTransition, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  sendMessage,
  deleteMessage,
  updateReaction,
  editMessage,
  markMessagesAsRead,
  setAuthToken,
} from "@/services/chat-api";
import { MessageType, StatusEnum } from "@/types/ChatType";

interface ChatActionsProps {
  chatId: string;
  replyToMessage: MessageType | null;
  setReplyToMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUserId?: string;
  addOptimisticMessage: (message: MessageType) => void;
  token: string;
}

export default function useChatActions({
  chatId,
  replyToMessage,
  setReplyToMessage,
  setMessages,
  currentUserId,
  addOptimisticMessage,
  token,
}: ChatActionsProps) {
  const pendingReadMessages = useRef<Set<string>>(new Set());
  const pendingSendMessages = useRef<
    Map<string, { content: string; replyToId?: string }>
  >(new Map());

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyToId?: string) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        toast.error("Message cannot be empty");
        return;
      }

      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage: MessageType = {
        _id: optimisticId,
        content,
        sender: {
          userId: currentUserId || "",
          name: "you",
          avatarUrl: "https://example.com/avatar.jpg",
        },
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.sent,
        reactions: [],
        receivers: [],
        attachments: attachments
          ? attachments.map((file) => ({
              name: file.name,
              url: URL.createObjectURL(file),
              type: file.type,
              localPath: file.name,
              status: "sent",
            }))
          : [],
        edited: {
          isEdited: false,
          editedAt: new Date(),
        },
        edits: [],
        readBy: [],
        deletedFor: [],
        formatting: new Map(),
        replyToId: replyToId || null,
      };

      pendingSendMessages.current.set(optimisticId, {
        content,
        replyToId,
      });

      startTransition(() => {
        addOptimisticMessage(optimisticMessage);
      });
      if (replyToId && replyToMessage?._id === replyToId) {
        setReplyToMessage(null);
      }

      try {
        setAuthToken(token);
        const response = await sendMessage({
          chatId,
          content,
          attachments,
          replyToId,
        });

        if (response) {
          pendingSendMessages.current.delete(optimisticId);

          setMessages((prev) =>
            prev.map((msg) => (msg._id === optimisticId ? response : msg)),
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);

        // Mark as failed
        startTransition(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === optimisticId
                ? { ...msg, status: StatusEnum.failed }
                : msg,
            ),
          );
        });

        toast.error(
          error instanceof Error && error.message
            ? error.message
            : "Failed to send message",
        );
      }
    },
    [
      chatId,
      replyToMessage,
      setReplyToMessage,
      token,
      setMessages,
      currentUserId,
      addOptimisticMessage,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      // Optimistically remove from UI
      const deletedMessage = {
        _id: messageId,
        chatId,
        status: StatusEnum.sending,
      };
      addOptimisticMessage(deletedMessage as MessageType);

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

      if (replyToMessage?._id === messageId) {
        setReplyToMessage(null);
      }

      try {
        await deleteMessage({
          chatId,
          messageId,
          forEveryone,
        });
        toast.success("Message deleted successfully");
      } catch (error) {
        console.error("Delete message error:", error);

        // Could restore the message here if needed

        toast.error(
          error instanceof Error && error.message
            ? error.message
            : "Failed to delete message",
        );
      }
    },
    [
      chatId,
      replyToMessage,
      setReplyToMessage,
      setMessages,
      addOptimisticMessage,
    ],
  );

  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      // Find the existing message
      setMessages((prev) => {
        const existingMessage = prev.find((msg) => msg._id === messageId);
        if (!existingMessage) return prev;

        // Create optimistic update
        const updatedMessage: MessageType = {
          ...existingMessage,
          reactions: [
            ...(existingMessage.reactions || []),
            {
              emoji,
              userId: currentUserId || "",
              timestamp: new Date(),
            },
          ],
        };

        addOptimisticMessage(updatedMessage);

        return prev;
      });

      // Make API call
      updateReaction({
        chatId,
        messageId,
        emoji,
      }).catch((error) => {
        console.error("Reaction update error:", error);
        toast.error("Failed to update reaction");
      });
    },
    [chatId, setMessages, currentUserId, addOptimisticMessage],
  );

  const handleEditMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!content.trim()) {
        toast.error("Message cannot be empty");
        return;
      }

      // Optimistic update
      setMessages((prev) => {
        const existingMessage = prev.find((msg) => msg._id === messageId);
        if (!existingMessage) return prev;

        const updatedMessage = {
          ...existingMessage,
          content,
          edited: {
            isEdited: true,
            editedAt: new Date(),
          },
          status: StatusEnum.sending,
        };

        addOptimisticMessage(updatedMessage);

        return prev;
      });

      try {
        const response = await editMessage({
          chatId,
          messageId,
          content,
        });

        if (response) {
          setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? response : msg)),
          );
        }

        toast.success("Message edited successfully");
      } catch (error) {
        console.error("Edit message error:", error);

        // Mark as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: StatusEnum.failed } : msg,
          ),
        );

        toast.error(
          error instanceof Error && error.message
            ? error.message
            : "Failed to edit message",
        );
      }
    },
    [chatId, setMessages, addOptimisticMessage],
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
            (!msg.readBy || !msg.readBy.some((r) => r.userId === currentUserId))
          ) {
            // Add to the set of messages to mark as read
            messagesToMark.add(msg._id);

            return {
              ...msg,
              readBy: [
                ...(msg.readBy || []),
                { userId: currentUserId, readAt },
              ],
            };
          }
          return msg;
        });
        return updatedMessages;
      });

      // Add messages to pending set
      messageIds?.forEach((id) => pendingReadMessages.current.add(id));

      // Debounced API call
      const idsToMark = messageIds || Array.from(messagesToMark);
      if (idsToMark.length === 0) return;

      try {
        await markMessagesAsRead({
          chatId,
          messageIds: idsToMark,
        });

        // Remove from pending set after success
        idsToMark.forEach((id) => pendingReadMessages.current.delete(id));
      } catch (error) {
        console.error("Error marking messages as read:", error);

        if (error instanceof Error && error.message.includes("network")) {
          toast.error("Network issue - read status may not sync", {
            duration: 3000,
            position: "bottom-right",
          });
        }
      }
    },
    [chatId, currentUserId, setMessages],
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
  };
}
