"use client";

import {
  createContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  use,
  startTransition,
  Dispatch,
  SetStateAction,
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
import { useChat } from "./ChatProvider";

interface ChatActionsContextType {
  messages: MessageType[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  replyToMessage: MessageType | undefined;
  handleReplyToMessage: (messageId: string) => void;
  handleSendMessage: (
    content: string,
    attachments?: File[],
    replyToId?: string,
  ) => Promise<void>;
  handleDeleteMessage: (
    messageId: string,
    forEveryone: boolean,
  ) => Promise<void>;
  handleReactToMessage: (messageId: string, emoji: string) => Promise<void>;
  handleEditMessage: (
    messageId: string,
    content: string,
    replyToId?: string,
  ) => Promise<void>;
  handleMarkAsRead: (messageIds: string[]) => Promise<void>;
  retryFailedMessage: (messageId: string) => Promise<void>;
  handleCancelReply: () => void;
}

const ChatActionsContext = createContext<ChatActionsContextType | undefined>(
  undefined,
);

export const useChatActions = () => {
  const context = use(ChatActionsContext);
  if (context === undefined) {
    throw new Error("useChatActions must be used within a ChatActionsProvider");
  }
  return context;
};

interface ChatActionsProviderProps {
  children: React.ReactNode;
}

export const ChatActionsProvider: React.FC<ChatActionsProviderProps> = ({
  children,
}) => {
  const {
    messages,
    setMessages,
    token,
    currentUser,
    currentChatId: chatId,
  } = useChat();
  const [replyToMessage, setReplyToMessage] = useState<MessageType | undefined>(
    undefined,
  );

  if (!currentUser || !currentUser.id) {
    toast.error("Current user not found");
    throw new Error("Current user not found");
  }

  const currentUserId = currentUser.id;

  /**
   * Refs to store pending messages and requests.
   */
  const pendingReadMessages = useRef<Set<string>>(new Set());

  /**
   * Refs to store pending messages and attachment `{messageId, {content, replyToId, atachments}}`.
   */
  const pendingSendMessages = useRef<
    Map<string, { content: string; replyToId?: string; attachments?: File[] }>
  >(new Map());

  /**
   *  attachment URL `{messageId, URLs}`.
   */
  const attachmentUrls = useRef<Map<string, string[]>>(new Map());

  /**
   * Store pending requests to avoid duplicate requests.
   */
  const pendingRequests = useRef<Set<string>>(new Set());

  /**
   * Mapping messages to their IDs for quick access.
   */
  const messagesMap = useRef<Map<string, MessageType>>(new Map());

  /**
   * Update messagesMap whenever messages change.
   */
  useEffect(() => {
    messagesMap.current = new Map(
      messages.map((message) => [message._id, message]),
    );
  }, [messages]);

  /**
   * Cleanup function to revoke object URLs for attachments.
   * @param messageId - The ID of the message whose attachments to clean up.
   */
  const cleanupAttachments = useCallback((messageId: string) => {
    const urls = attachmentUrls.current.get(messageId);
    if (urls) {
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error(
            `Failed to revoke URL for message ${messageId}:`,
            error,
          );
        }
      });
      attachmentUrls.current.delete(messageId);
    }
  }, []);

  /**
   * Clean up all attachment URLs on unmount
   */
  useEffect(() => {
    const urls = attachmentUrls.current;
    return () => {
      urls.forEach((blobUrls) =>
        blobUrls.forEach((url) => URL.revokeObjectURL(url)),
      );
      urls.clear();
    };
  }, []);

  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length) return;
      try {
        setAuthToken(token);
        await markMessagesAsRead({ chatId: chatId!, messageIds });
        messageIds.forEach((id) => pendingReadMessages.current.delete(id));
      } catch (error) {
        console.error("Mark as Read Error: ", error);
      }
    },
    [chatId, token],
  );

  /**
   * Debounced function to mark messages as read.
   * @param messageIds - The IDs of the messages to mark as read.
   */
  const debouncedMarkAsReadHandler = useMemo(
    () => debounce(markAsRead, 1000),
    [markAsRead],
  );

  /**
   * Retry sending a failed message with optimistic UI update.
   * @param messageId - The ID of the message to retry.
   * @returns A promise that resolves when the message is retried.
   * @throws An error if the message cannot be retried.
   */
  const retryFailedMessage = useCallback(
    async (messageId: string) => {
      const message = messagesMap.current.get(messageId);
      if (!message || message.status !== StatusEnum.failed) return;

      const requestId = `retry-${messageId}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);
      // Update status to sending
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...message,
                status: StatusEnum.sending,
              }
            : m,
        ),
      );

      const pendingMessageData = pendingSendMessages.current.get(messageId);
      if (!pendingMessageData) {
        toast.error("Cannot retry: message data lost");
        pendingRequests.current.delete(requestId);
        return;
      }

      try {
        setAuthToken(token);
        const { content, replyToId, attachments = [] } = pendingMessageData;
        const response = await sendMessage({
          chatId: chatId!,
          content,
          attachments,
          replyToId,
        });

        if (!response) throw new Error("Empty server response.");

        pendingSendMessages.current.delete(messageId);
        cleanupAttachments(messageId);

        // Update with server response
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId
              ? { ...response, tempId: messageId }
              : message,
          ),
        );

        toast.success("Message sent successfully");
      } catch (error) {
        // Update with failure status
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? {
                  ...message,
                  attachments: message.attachments.map((attachment) => ({
                    ...attachment,
                    status: StatusEnum.failed,
                  })),
                  status: StatusEnum.failed,
                }
              : m,
          ),
        );

        toast.error(
          error instanceof Error ? error.message : "Failed to send message",
        );
      } finally {
        pendingRequests.current.delete(requestId);
      }
    },
    [chatId, token, setMessages, cleanupAttachments],
  );

  /**
   * Send a new message with optimistic UI update.
   * @param content - The content of the message.
   * @param attachments - The attachments to include with the message.
   * @param replyToId - The ID of the message being replied to.
   * @returns A promise that resolves when the message is sent.
   * @throws An error if the message cannot be sent.
   */
  const handleSendMessage = useCallback(
    async (
      content: string,
      attachments: File[] = [],
      replyToId?: string,
    ): Promise<void> => {
      if (!content.trim() && !attachments.length) {
        toast.error("Message cannot be empty");
        return;
      }
      if (!chatId) {
        toast.error("No chat ID provided");
        return;
      }

      const tempId = `temp-${Math.random().toString(36).slice(2, 11)}`;
      const blobUrls = attachments.map((file) => URL.createObjectURL(file));
      if (blobUrls.length) attachmentUrls.current.set(tempId, blobUrls);

      const optimisticMessage: MessageType = {
        _id: tempId,
        content,
        sender: {
          userId: currentUserId,
          name: "you",
          avatarUrl: "https://example.com/avatar.jpg",
        },
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: StatusEnum.sending,
        reactions: [],
        isPinned: false,
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

      pendingSendMessages.current.set(tempId, {
        content,
        replyToId,
        attachments,
      });

      setMessages((prev) => [...prev, optimisticMessage]);

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

        if (!response) throw new Error("Empty server response");

        pendingSendMessages.current.delete(tempId);
        cleanupAttachments(tempId);

        const finalResponse = {
          ...response,
          chatId: response.chatId,
        };

        setMessages((prev) => {
          const messageIndex = prev.findIndex((msg) => msg._id === tempId);

          if (messageIndex >= 0) {
            console.log(
              `Replacing temp message ${tempId} at index ${messageIndex} with server message: ${finalResponse._id}`,
            );
            const updatedMessages = [...prev];
            updatedMessages[messageIndex] = finalResponse;
            return updatedMessages;
          }
          console.log(
            `Could not find temp message ${tempId}, adding server message: ${finalResponse._id} as new entry`,
          );
          return [...prev, finalResponse];
        });
      } catch (error) {
        // Update with failure status

        setMessages((prev) => [
          ...prev,
          {
            ...optimisticMessage,
            status: StatusEnum.failed,
            attachments: optimisticMessage.attachments.map((a) => ({
              ...a,
              status: StatusEnum.failed,
            })),
          },
        ]);

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
      currentUserId,
      cleanupAttachments,
      setMessages,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      const requestId = `delete-${messageId}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (message) {
        setMessages((prev) => [
          ...prev,
          { ...message, status: StatusEnum.deleting },
        ]);
      }

      if (replyToMessage?._id === messageId) setReplyToMessage(undefined);

      try {
        setAuthToken(token);
        await deleteMessage({ chatId: chatId!, messageId, forEveryone });
        pendingRequests.current.delete(requestId);

        if (forEveryone) {
          setMessages((prev) =>
            prev.filter((message) => message._id !== messageId),
          );
        } else {
          setMessages((prev) =>
            prev
              .map((message) =>
                message._id === messageId
                  ? {
                      ...message,
                      deletedFor: [
                        ...message.deletedFor,
                        { userId: currentUserId, deletedAt: new Date() },
                      ],
                    }
                  : message,
              )
              .filter(
                (message) =>
                  !message.deletedFor.some(
                    (ele) => ele.userId === currentUserId,
                  ),
              ),
          );
        }

        cleanupAttachments(messageId);
        toast.success("Message deleted");
      } catch (error) {
        pendingRequests.current.delete(requestId);
        if (message) {
          setMessages((prev) => [
            ...prev,
            { ...message, status: StatusEnum.sent },
          ]);
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, status: StatusEnum.sent } : msg,
            ),
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
      currentUserId,
    ],
  );

  const handleReactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      const requestId = `react-${messageId}-${emoji}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (!message) {
        toast.error("Message not found");
        pendingRequests.current.delete(requestId);
        return;
      }
      const prevReaction = [...message.reactions];
      const hasReacted = prevReaction.some(
        (r) => r.userId === currentUserId && r.emoji === emoji,
      );
      const updatedReactions = hasReacted
        ? prevReaction.filter(
            (r) => !(r.userId !== currentUserId && r.emoji !== emoji),
          )
        : [
            ...prevReaction,
            { userId: currentUserId, emoji, timestamp: new Date() },
          ];
      if (message && currentUserId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, reactions: updatedReactions }
              : msg,
          ),
        );
      }

      try {
        setAuthToken(token);
        const response = await updateReaction({
          chatId: chatId!,
          messageId,
          emoji,
        });
        if (!response) throw new Error("Empty server response");

        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId ? response : message,
          ),
        );
      } catch (error) {
        startTransition(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, reactions: prevReaction } : msg,
            ),
          );
        });
        console.error("Reaction error:", error);
        toast.error("Failed to react to message");
      } finally {
        pendingRequests.current.delete(requestId);
      }
    },
    [chatId, setMessages, currentUserId, token],
  );

  const handleEditMessage = useCallback(
    async (
      messageId: string,
      content: string,
      replyToId?: string,
    ): Promise<void> => {
      if (!content.trim()) {
        toast.error("Message cannot be empty");
        return;
      }

      const requestId = `edit-${messageId}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  content,
                  edited: { editedAt: new Date(), isEdited: true },
                  status: StatusEnum.sending,
                }
              : msg,
          ),
        );
      }

      try {
        setAuthToken(token);
        const response = await editMessage({
          chatId: chatId!,
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
        if (message) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    status: StatusEnum.failed,
                  }
                : msg,
            ),
          );
        }

        toast.error(
          error instanceof Error ? error.message : "Failed to edit message",
        );
      } finally {
        pendingRequests.current.delete(requestId);
      }
    },
    [chatId, setMessages, token],
  );

  const handleMarkAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!currentUserId || !chatId) return;

      const readAt = new Date();
      const messagesToUpdateOptimistically: MessageType[] = [];

      setMessages((prev) => {
        return prev.map((message) => {
          if (
            messageIds.includes(message._id) &&
            message.sender.userId !== currentUserId &&
            !message.readBy.some((r) => r.userId === currentUserId)
          ) {
            const updatedMessage = {
              ...message,
              readBy: [...message.readBy, { userId: currentUserId, readAt }],
            };
            messagesToUpdateOptimistically.push(updatedMessage);
            return updatedMessage;
          }
          return message;
        });
      });

      const idsToMarkForAPI = new Set(messageIds);
      messagesToUpdateOptimistically.forEach((msg) =>
        idsToMarkForAPI.add(msg._id),
      );
      const finalIds = Array.from(idsToMarkForAPI);

      if (!finalIds.length) return;

      finalIds.forEach((id) => pendingReadMessages.current.add(id));
      debouncedMarkAsReadHandler(finalIds);
    },
    [chatId, currentUserId, setMessages, debouncedMarkAsReadHandler],
  );

  // Handle pending read messages when component unmounts
  useEffect(() => {
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
  }, [chatId, currentUserId, token]);

  const handleCancelReply = useCallback(
    () => setReplyToMessage(undefined),
    [setReplyToMessage],
  );

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => messageId === msg._id);
      if (message) setReplyToMessage(message);
    },
    [setReplyToMessage, messages],
  );

  const value = {
    messages,
    setMessages,
    replyToMessage,
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    handleEditMessage,
    handleMarkAsRead,
    retryFailedMessage,
    handleCancelReply,
    handleReplyToMessage,
  };

  return (
    <ChatActionsContext.Provider value={value}>
      {children}
    </ChatActionsContext.Provider>
  );
};
