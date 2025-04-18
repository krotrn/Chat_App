"use client";
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
  replyToMessage: MessageType | undefined;
  setReplyToMessage: React.Dispatch<
    React.SetStateAction<MessageType | undefined>
  >;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUserId?: string;
  addOptimisticMessage: (message: MessageType) => void;
  token: string;
}

/**
 * Custom hook to manage chat actions such as sending, deleting, reacting to,
 * editing, and marking messages as read with optimistic updates.
 */
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
  const attachmentUrls = useRef<Map<string, string[]>>(new Map());
  const pendingRequests = useRef<Set<string>>(new Set());

  // Clean up blob URLs for a message's attachments
  const cleanupAttachments = useCallback((messageId: string) => {
    const urls = attachmentUrls.current.get(messageId);
    if (urls) {
      urls.forEach((url) => URL.revokeObjectURL(url));
      attachmentUrls.current.delete(messageId);
    }
  }, []);

  // Clean up all attachment URLs on unmount
  useEffect(() => {
    const urls = attachmentUrls.current;
    return () => {
      urls.forEach((blobUrls) =>
        blobUrls.forEach((url) => URL.revokeObjectURL(url)),
      );
      urls.clear();
    };
  }, []);

  // Send a new message with optimistic UI update
  const handleSendMessage = useCallback(
    async (content: string, attachments: File[] = [], replyToId?: string) => {
      if (!content.trim() && !attachments.length)
        return toast.error("Message cannot be empty");
      if (!chatId) return toast.error("No chat ID provided");

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const blobUrls = attachments.map((file) => URL.createObjectURL(file));
      if (blobUrls.length) attachmentUrls.current.set(tempId, blobUrls);

      const optimisticMessage: MessageType = {
        _id: tempId,
        content,
        sender: {
          userId: currentUserId || "",
          name: "you",
          avatarUrl: "https://example.com/avatar.jpg",
        },
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.sending,
        reactions: [],
        receivers: [],
        attachments: attachments.map((file, i) => ({
          name: file.name,
          url: blobUrls[i],
          type: file.type,
          localPath: file.name,
          status: StatusEnum.sending,
        })),
        edited: { isEdited: false, editedAt: new Date() },
        edits: [],
        readBy: [],
        deletedFor: [],
        formatting: {},
        replyToId: replyToId,
      };

      pendingSendMessages.current.set(tempId, { content, replyToId });
      startTransition(() => addOptimisticMessage(optimisticMessage));
      if (replyToId && replyToMessage?._id === replyToId)
        setReplyToMessage(undefined);

      try {
        setAuthToken(token);
        const response = await sendMessage({
          chatId,
          content,
          attachments,
          replyToId,
        });
        if (!response) throw new Error("Empty server response");

        pendingSendMessages.current.delete(tempId);
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === response._id);
          if (exists) {
            cleanupAttachments(tempId);
            return prev.filter((msg) => msg._id !== tempId);
          }
          return prev.map((msg) =>
            msg._id === tempId ? (cleanupAttachments(tempId), response) : msg,
          );
        });
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? {
                  ...msg,
                  status: StatusEnum.failed,
                  attachments: msg.attachments?.map((att) => ({
                    ...att,
                    status: StatusEnum.failed,
                  })),
                }
              : msg,
          ),
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to send message",
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
      cleanupAttachments,
    ],
  );

  // Delete a message with optimistic UI update
  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      console.log(messageId, forEveryone);
      const requestId = `delete-${messageId}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      let deletedMessage: MessageType | undefined;
      setMessages((prev) => {
        deletedMessage = prev.find((msg) => msg._id === messageId);
        if (deletedMessage) cleanupAttachments(messageId);
        return prev.filter((msg) => msg._id !== messageId);
      });

      if (replyToMessage?._id === messageId) setReplyToMessage(undefined);

      try {
        setAuthToken(token);
        await deleteMessage({ chatId, messageId, forEveryone });
        pendingRequests.current.delete(requestId);
        toast.success("Message deleted");
      } catch (error) {
        pendingRequests.current.delete(requestId);
        if (deletedMessage) {
          setMessages((prev) =>
            prev.some((msg) => msg._id === messageId)
              ? prev
              : [...prev, deletedMessage!],
          );
        }
        toast.error(
          error instanceof Error ? error.message : "Failed to delete message",
        );
      }
    },
    [
      chatId,
      replyToMessage,
      setReplyToMessage,
      setMessages,
      token,
      cleanupAttachments,
    ],
  );

  // React to a message with optimistic UI update
  const handleReactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      const requestId = `react-${messageId}-${emoji}-${Date.now()}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      setMessages((prev) => {
        const msg = prev.find((m) => m._id === messageId);
        if (!msg) return prev;

        const hasReaction = msg.reactions?.some(
          (r) => r.userId === currentUserId && r.emoji === emoji,
        );
        return prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                reactions: hasReaction
                  ? m.reactions.filter(
                      (r) => !(r.userId === currentUserId && r.emoji === emoji),
                    )
                  : [
                      ...(m.reactions || []),
                      {
                        emoji,
                        userId: currentUserId || "",
                        timestamp: new Date(),
                      },
                    ],
              }
            : m,
        );
      });

      try {
        setAuthToken(token);
        const response = await updateReaction({ chatId, messageId, emoji });
        if (!response) throw new Error("Empty server response");
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? response : msg)),
        );
        pendingRequests.current.delete(requestId);
      } catch (error) {
        pendingRequests.current.delete(requestId);
        console.error("Reaction error:", error);
      }
    },
    [chatId, setMessages, currentUserId, token],
  );

  // Edit a message with optimistic UI update
  const handleEditMessage = useCallback(
    async (messageId: string, content: string, replyToId?:string) => {
      if (!content.trim()) return toast.error("Message cannot be empty");

      setMessages((prev) => {
        const msg = prev.find((m) => m._id === messageId);
        if (!msg) return prev;
        const updated = {
          ...msg,
          content,
          edited: { isEdited: true, editedAt: new Date() },
          status: StatusEnum.sending,
        };
        addOptimisticMessage(updated);
        return prev;
      });

      try {
        setAuthToken(token);
        const response = await editMessage({ chatId, messageId, content, replyToId });
        if (response) {
          setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? response : msg)),
          );
          toast.success("Message edited");
        }
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: StatusEnum.failed } : msg,
          ),
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to edit message",
        );
      }
    },
    [chatId, setMessages, addOptimisticMessage, token],
  );

  // Mark messages as read with optimistic UI update
  const handleMarkAsRead = useCallback(
    async (messageIds?: string[]) => {
      if (!currentUserId || !chatId) return;

      const readAt = new Date();
      const toMark = new Set<string>();

      setMessages((prev) => {
        return prev.map((msg) => {
          if (
            (!messageIds || messageIds.includes(msg._id)) &&
            msg.sender.userId !== currentUserId &&
            !msg.readBy?.some((r) => r.userId === currentUserId)
          ) {
            toMark.add(msg._id);
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
      });

      const ids = messageIds || [...toMark];
      if (!ids.length) return;
      ids.forEach((id) => pendingReadMessages.current.add(id));

      try {
        await markMessagesAsRead({ chatId, messageIds: ids });
        ids.forEach((id) => pendingReadMessages.current.delete(id));
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    },
    [chatId, currentUserId, setMessages],
  );

  // Mark messages as read on chat load and cleanup on unmount
  useEffect(() => {
    if (chatId && currentUserId) handleMarkAsRead();

    // Capture the current values to use in cleanup
    const pendingMessages = pendingReadMessages.current;
    const currentChatId = chatId;

    return () => {
      if (pendingMessages.size && currentChatId) {
        markMessagesAsRead({
          chatId: currentChatId,
          messageIds: [...pendingMessages],
        }).catch(console.error);
      }
    };
  }, [chatId, currentUserId, handleMarkAsRead]);

  return {
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    handleEditMessage,
    handleMarkAsRead,
  };
}
