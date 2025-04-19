"use client";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
import { debounce } from "lodash";

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
  messagesMap?: Map<string, MessageType>;
}

export default function useChatActions({
  chatId,
  replyToMessage,
  setReplyToMessage,
  setMessages,
  currentUserId,
  addOptimisticMessage,
  token,
  messagesMap = new Map(),
}: ChatActionsProps) {
  const pendingReadMessages = useRef<Set<string>>(new Set());
  const pendingSendMessages = useRef<
    Map<string, { content: string; replyToId?: string; attachments?: File[] }>
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

  const debouncedMarkAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length) return;
      try {
        setAuthToken(token);
        await markMessagesAsRead({ chatId, messageIds });
        messageIds.forEach((id) => pendingReadMessages.current.delete(id));
      } catch (error) {
        console.error("Mark as Read Error: ", error);
      }
    },
    [chatId, token],
  );

  const debouncedMarkAsReadHandler = useMemo(
    () => debounce(debouncedMarkAsRead, 1000),
    [debouncedMarkAsRead],
  );

  const retryFailedMessage = useCallback(
    async (messageId: string) => {
      const message = messagesMap.get(messageId);
      if (!message || message.status === StatusEnum.failed) return;
      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? { ...message, status: StatusEnum.sending }
            : message,
        ),
      );
      const pendingMessageData = pendingSendMessages.current.get(messageId);
      if (!pendingMessageData) {
        toast.error("Cannot retry: message data lost");
        return;
      }
      try {
        setAuthToken(token);
        const { content, replyToId, attachments = [] } = pendingMessageData;
        const response = await sendMessage({
          chatId,
          content,
          attachments,
          replyToId,
        });
        if (!response) throw new Error("Empty server response.");
        pendingSendMessages.current.delete(messageId);
        cleanupAttachments(messageId);
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? { ...response, tempId: messageId }
              : message,
          ),
        );

        toast.success("Message sent successfully");
      } catch (error) {
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? {
                  ...message,
                  attachments: message.attachments.map((attachment) => ({
                    ...attachment,
                    status: StatusEnum.failed,
                  })),
                  status: StatusEnum.failed,
                }
              : message,
          ),
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to send message",
        );
      }
    },
    [messagesMap, chatId, token, setMessages, cleanupAttachments],
  );

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
      if (replyToId && replyToMessage?._id === replyToId) {
        setReplyToMessage(undefined);
      }

      try {
        setAuthToken(token);
        const response = await sendMessage({
          chatId,
          content,
          attachments,
          replyToId,
        });
        console.log("Message sent response:", response);
        if (!response) throw new Error("Empty server response");

        pendingSendMessages.current.delete(tempId);
        cleanupAttachments(tempId);

        const finalResponse = {
          ...response,
          chatId: response.chatId || chatId,
        };

        setMessages((prev) => {
          // Find the temporary message by ID
          const messageIndex = prev.findIndex((msg) => msg._id === tempId);

          if (messageIndex >= 0) {
            console.log(
              `Replacing temp message at index ${messageIndex} with server message: ${finalResponse._id}`,
            );
            const updatedMessages = [...prev];
            updatedMessages[messageIndex] = finalResponse;
            return updatedMessages;
          }

          console.log(
            `Could not find temp message ${tempId}, adding server message: ${finalResponse._id}`,
          );
          return [...prev, finalResponse];
        });
      } catch (error) {
        setMessages((prev) =>
          prev.map((message) =>
            message._id === tempId
              ? {
                  ...message,
                  status: StatusEnum.failed,
                  attachments: message.attachments?.map((attachment) => ({
                    ...attachment,
                    status: StatusEnum.failed,
                  })),
                }
              : message,
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
      const requestId = `delete-${messageId}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                status: StatusEnum.deleting,
              }
            : message,
        ),
      );

      if (replyToMessage?._id === messageId) setReplyToMessage(undefined);

      try {
        setAuthToken(token);
        await deleteMessage({ chatId, messageId, forEveryone });
        pendingRequests.current.delete(requestId);
        setMessages((prev) =>
          prev.filter((message) => message._id !== messageId),
        );
        cleanupAttachments(messageId);
        toast.success("Message deleted");
      } catch (error) {
        pendingRequests.current.delete(requestId);
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? { ...message, status: StatusEnum.sent }
              : message,
          ),
        );

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

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                reactions: message.reactions
                  .map((reaction) =>
                    reaction.userId === currentUserId
                      ? reaction.emoji === emoji
                        ? undefined
                        : {
                            emoji,
                            timestamp: new Date(),
                            userId: currentUserId,
                          }
                      : reaction,
                  )
                  .filter((reaction) => reaction !== undefined),
              }
            : message,
        ),
      );

      try {
        setAuthToken(token);
        const response = await updateReaction({ chatId, messageId, emoji });
        if (!response) throw new Error("Empty server response");
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId ? response : message,
          ),
        );
        pendingRequests.current.delete(requestId);
      } catch (error) {
        pendingRequests.current.delete(requestId);
        console.error("Reaction error:", error);
        toast.error("Failed to react to message");
      }
    },
    [chatId, setMessages, currentUserId, token],
  );

  // Edit a message with optimistic UI update
  const handleEditMessage = useCallback(
    async (messageId: string, content: string, replyToId?: string) => {
      if (!content.trim()) return toast.error("Message cannot be empty");

      setMessages((prev) =>
        prev.map((message) =>
          message._id === messageId
            ? {
                ...message,
                content,
                edited: { editedAt: new Date(), isEdited: true },
                status: StatusEnum.sending,
              }
            : message,
        ),
      );

      try {
        setAuthToken(token);
        const response = await editMessage({
          chatId,
          messageId,
          content,
          replyToId,
        });
        if (!response) throw new Error("Failed to Send Message.");
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId ? response : message,
          ),
        );
        toast.success("Message edited");
      } catch (error) {
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? { ...message, status: StatusEnum.failed }
              : message,
          ),
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to edit message",
        );
      }
    },
    [chatId, setMessages, token],
  );

  // Mark messages as read with optimistic UI update
  const handleMarkAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!currentUserId || !chatId) return;

      const readAt = new Date();
      const toMark = new Set<string>();

      setMessages((prev) =>
        prev.map((message) => {
          if (
            messageIds.includes(message._id) &&
            message.sender.userId !== currentUserId &&
            !message.readBy.some((r) => r.userId === currentUserId)
          ) {
            toMark.add(message._id);
            return {
              ...message,
              readBy: [...message.readBy, { userId: currentUserId, readAt }],
            };
          }
          return message;
        }),
      );

      const ids = messageIds || [...toMark];
      if (!ids.length) return;
      ids.forEach((id) => pendingReadMessages.current.add(id));
      debouncedMarkAsReadHandler(ids);
    },
    [chatId, currentUserId, setMessages, debouncedMarkAsReadHandler],
  );

  useEffect(() => {
    if (chatId && currentUserId) handleMarkAsRead([]);

    const pendingMessages = pendingReadMessages.current;

    return () => {
      if (pendingMessages.size && chatId) {
        setAuthToken(token);
        markMessagesAsRead({
          chatId,
          messageIds: [...pendingMessages],
        }).catch(console.error);
      }
    };
  }, [chatId, currentUserId, handleMarkAsRead, token]);

  return {
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    handleEditMessage,
    handleMarkAsRead,
    retryFailedMessage,
  };
}
