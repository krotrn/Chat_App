"use client";

import {
  createContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  use,
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
  messagesMap: React.RefObject<Map<string, MessageType>>;
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
    setChats,
  } = useChat();
  const [replyToMessage, setReplyToMessage] = useState<MessageType | undefined>(
    undefined,
  );

  if (!currentUser?.id) {
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

  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds.length || !chatId) return;
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

  /**
   * Debounced function to mark messages as read.
   * @param messageIds - The IDs of the messages to mark as read.
   */
  const debouncedMarkAsReadHandler = useMemo(
    () => debounce(markAsRead, 1000, { leading: false, trailing: true }),
    [markAsRead],
  );

  /**
   * Clean up all attachment URLs and pending operations on unmount
   */
  useEffect(() => {
    const urls = attachmentUrls.current;
    const pendingMessages = pendingSendMessages.current;
    const pendingReadMessagesRef = pendingReadMessages.current;
    return () => {
      urls.forEach((blobUrls) =>
        blobUrls.forEach((url) => URL.revokeObjectURL(url)),
      );
      urls.clear();
      pendingMessages.forEach((_, messageId) => cleanupAttachments(messageId));
      pendingMessages.clear();
      debouncedMarkAsReadHandler.cancel();
      const pendingReadIds = Array.from(pendingReadMessagesRef);
      if (pendingReadIds.length && chatId && token) {
        setAuthToken(token);
        markMessagesAsRead({ chatId, messageIds: pendingReadIds }).catch(
          (error) =>
            console.error(
              "Error marking messages as read during cleanup : ",
              error,
            ),
        );
      }
    };
  }, [cleanupAttachments, debouncedMarkAsReadHandler, chatId, token]);

  /**
   * Retry sending a failed message with optimistic UI update.
   * @param messageId - The ID of the message to retry.
   * @returns A promise that resolves when the message is retried.
   * @throws An error if the message cannot be retried.
   */
  const retryFailedMessage = useCallback(
    async (messageId: string) => {
      const message = messagesMap.current.get(messageId);
      if (!message || message.status !== StatusEnum.failed)
        return Promise.resolve();

      const requestId = `retry-${messageId}`;
      if (pendingRequests.current.has(requestId)) return Promise.resolve();
      pendingRequests.current.add(requestId);
      // Update status to sending
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...message,
                status: StatusEnum.sending,
              }
            : msg,
        ),
      );

      setChats((chats) =>
        chats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg._id === messageId
                    ? { ...msg, status: StatusEnum.sending }
                    : msg,
                ),
              }
            : chat,
        ),
      );

      const pendingMessageData = pendingSendMessages.current.get(messageId);
      if (!pendingMessageData) {
        toast.error("Cannot retry: message data lost");
        pendingRequests.current.delete(requestId);
        return Promise.reject(new Error("Message data not found"));
      }

      try {
        if (!chatId) {
          throw new Error("No chat selected");
        }
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

        // Update with server response
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId ? response : message,
          ),
        );
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId ? response : msg,
                  ),
                }
              : chat,
          ),
        );

        toast.success("Message sent successfully");
        return Promise.resolve();
      } catch (error) {
        // Update with failure status
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...message,
                  attachments: message.attachments.map((attachment) => ({
                    ...attachment,
                    status: StatusEnum.failed,
                  })),
                  status: StatusEnum.failed,
                }
              : msg,
          ),
        );
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId
                      ? {
                          ...msg,
                          attachments: msg.attachments.map((att) => ({
                            ...att,
                            status: StatusEnum.failed,
                          })),
                          status: StatusEnum.failed,
                        }
                      : msg,
                  ),
                }
              : chat,
          ),
        );

        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";

        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
      } finally {
        pendingRequests.current.delete(requestId);
      }
    },
    [chatId, token, setMessages, cleanupAttachments, setChats],
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
        return Promise.reject(new Error("Empty message"));
      }
      if (!chatId) {
        toast.error("No chat ID provided");
        return Promise.reject(new Error("No chat ID provided"));
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
      setChats((chats) =>
        chats.map((chat) =>
          chat._id === chatId
            ? { ...chat, messages: [...chat.messages, optimisticMessage] }
            : chat,
        ),
      );

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

        setMessages((prev) => {
          const messageIndex = prev.findIndex((msg) => msg._id === tempId);

          if (messageIndex >= 0) {
            const updatedMessages = [...prev];
            updatedMessages[messageIndex] = response;
            return updatedMessages;
          }
          return [...prev, response];
        });

        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === optimisticMessage._id ? response : msg,
                  ),
                }
              : chat,
          ),
        );
        return Promise.resolve();
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
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === optimisticMessage._id
                      ? { ...msg, status: StatusEnum.failed }
                      : msg,
                  ),
                }
              : chat,
          ),
        );

        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
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
      setChats,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      if (!chatId) {
        toast.error("No chat selected");
        return Promise.reject(new Error("No chat ID provided"));
      }
      const requestId = `delete-${messageId}`;
      if (pendingRequests.current.has(requestId)) return Promise.resolve();
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (!message) {
        pendingRequests.current.delete(requestId);
        toast.error("Message not found");
        return Promise.reject(new Error("Message not found"));
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: StatusEnum.deleting } : msg,
        ),
      );

      setChats((chats) =>
        chats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg._id === messageId
                    ? { ...msg, status: StatusEnum.deleting }
                    : msg,
                ),
              }
            : chat,
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
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter(
                    (msg) => msg._id !== messageId,
                  ),
                }
              : chat,
          ),
        );

        cleanupAttachments(messageId);
        toast.success("Message deleted");
        return Promise.resolve();
      } catch (error) {
        pendingRequests.current.delete(requestId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, status: StatusEnum.sent } : msg,
          ),
        );
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId
                      ? { ...msg, status: StatusEnum.sent }
                      : msg,
                  ),
                }
              : chat,
          ),
        );
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete message";
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    },
    [
      chatId,
      replyToMessage,
      setReplyToMessage,
      setMessages,
      token,
      cleanupAttachments,
      setChats,
    ],
  );

  const handleReactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      if (!chatId) {
        toast.error("No chat selected");
        return Promise.reject(new Error("No chat ID provided"));
      }

      const requestId = `react-${messageId}-${emoji}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (!message) {
        pendingRequests.current.delete(requestId);
        toast.error("Message not found");
        return Promise.reject(new Error("Message not found"));
      }
      // Store original reactions for rollback if needed
      const prevReactions = [...message.reactions];

      // Optimistic update
      const hasReacted = prevReactions.some(
        (r) => r.userId === currentUserId && r.emoji === emoji,
      );

      const updatedReactions = hasReacted
        ? prevReactions.filter(
            (r) => !(r.userId === currentUserId && r.emoji === emoji),
          )
        : [
            ...prevReactions,
            { userId: currentUserId, emoji, timestamp: new Date() },
          ];

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: updatedReactions } : msg,
        ),
      );

      setChats((chats) =>
        chats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg._id === messageId
                    ? { ...msg, reactions: updatedReactions }
                    : msg,
                ),
              }
            : chat,
        ),
      );

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
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId ? response : msg,
                  ),
                }
              : chat,
          ),
        );
        return Promise.resolve();
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: prevReactions } : msg,
          ),
        );
        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId
                      ? { ...msg, reactions: prevReactions }
                      : msg,
                  ),
                }
              : chat,
          ),
        );
        console.error("Reaction error:", error);
        return Promise.reject(new Error("Failed to react to message"));
      } finally {
        pendingRequests.current.delete(requestId);
      }
    },
    [chatId, setMessages, currentUserId, token, setChats],
  );

  const handleEditMessage = useCallback(
    async (
      messageId: string,
      content: string,
      replyToId?: string,
    ): Promise<void> => {
      if (!content.trim()) {
        toast.error("Message cannot be empty");
        return Promise.reject(new Error("Failed to react to message"));
      }

      if (!chatId) {
        toast.error("No chat selected");
        return Promise.reject(new Error("No chat ID provided"));
      }

      const requestId = `edit-${messageId}`;
      if (pendingRequests.current.has(requestId)) return Promise.resolve();
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (!message) {
        pendingRequests.current.delete(requestId);
        toast.error("Message not found");
        return Promise.reject(new Error("Message not found"));
      }
      // Store original message for rollback if needed
      const originalMessage = { ...message };

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                content: content.trim(),
                edited: { editedAt: new Date(), isEdited: true },
                status: StatusEnum.sending,
              }
            : msg,
        ),
      );

      setChats((chats) =>
        chats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg._id === messageId
                    ? {
                        ...msg,
                        content: content.trim(),
                        edited: { editedAt: new Date(), isEdited: true },
                        status: StatusEnum.sending,
                      }
                    : msg,
                ),
              }
            : chat,
        ),
      );

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

        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId ? response : msg,
                  ),
                }
              : chat,
          ),
        );

        toast.success("Message edited");
        return Promise.resolve();
      } catch (error) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...originalMessage,
                  status: StatusEnum.failed,
                }
              : msg,
          ),
        );

        setChats((chats) =>
          chats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg._id === messageId
                      ? { ...originalMessage, status: StatusEnum.failed }
                      : msg,
                  ),
                }
              : chat,
          ),
        );

        const errorMessage =
          error instanceof Error ? error.message : "Failed to edit message";
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
      } finally {
        pendingRequests.current.delete(requestId);
      }
    },
    [chatId, setMessages, token, setChats],
  );

  /**
   * Mark messages as read with optimistic UI update.
   * @param messageIds - The IDs of the messages to mark as read.
   * @returns A promise that resolves when the messages are marked as read.
   */
  const handleMarkAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!currentUserId || !chatId || !messageIds.length)
        return Promise.resolve();

      const readAt = new Date();
      const validMessageIds: string[] = [];

      setMessages((prev) => {
        return prev.map((message) => {
          if (
            messageIds.includes(message._id) &&
            message.sender.userId !== currentUserId &&
            !message.readBy.some((r) => r.userId === currentUserId)
          ) {
            validMessageIds.push(message._id);
            return {
              ...message,
              readBy: [...message.readBy, { userId: currentUserId, readAt }],
            };
          }
          return message;
        });
      });

      setChats((chats) =>
        chats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (
                    validMessageIds.includes(msg._id) &&
                    msg.sender.userId !== currentUserId &&
                    !msg.readBy.some((r) => r.userId === currentUserId)
                  ) {
                    return {
                      ...msg,
                      readBy: [
                        ...msg.readBy,
                        { userId: currentUserId, readAt },
                      ],
                    };
                  }
                  return msg;
                }),
              }
            : chat,
        ),
      );

      if (!validMessageIds.length) {
        return Promise.resolve();
      }
      // Add to pending read messages
      validMessageIds.forEach((id) => pendingReadMessages.current.add(id));

      // Schedule the API call using debounce
      await debouncedMarkAsReadHandler(validMessageIds);
      return Promise.resolve();
    },
    [chatId, currentUserId, setMessages, debouncedMarkAsReadHandler, setChats],
  );

  const handleCancelReply = useCallback(
    () => setReplyToMessage(undefined),
    [setReplyToMessage],
  );

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = messagesMap.current.get(messageId);

      if (message) setReplyToMessage(message);
    },
    [setReplyToMessage, messagesMap],
  );

  const value = useMemo(
    () => ({
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
      messagesMap,
    }),
    [
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
      messagesMap,
    ],
  );

  return (
    <ChatActionsContext.Provider value={value}>
      {children}
    </ChatActionsContext.Provider>
  );
};
