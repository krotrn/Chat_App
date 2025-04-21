"use client";

import React, {
  createContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useOptimistic,
  use,
  startTransition,
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
  optimisticMessages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
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
  updateOptimisticMessage: (message: MessageType) => void;
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

  const [optimisticMessages, updateOptimisticMessage] = useOptimistic(
    messages,
    (state: MessageType[], newMessage: MessageType) => {
      const existingIndex = state.findIndex(
        (message) => message._id === newMessage._id,
      );
      if (existingIndex >= 0) {
        const updatedState = [...state];
        updatedState[existingIndex] = newMessage;
        return updatedState;
      }

      if (!newMessage._id.startsWith("temp-")) {
        let tempIndex = state.findIndex(
          (msg) =>
            msg._id.startsWith("temp-") &&
            msg.content === newMessage.content &&
            msg.sender.userId === newMessage.sender.userId &&
            (msg.chatId === newMessage.chatId || newMessage.chatId === null),
        );

        if (tempIndex < 0) {
          const serverTime = new Date(newMessage.createdAt).getTime();
          tempIndex = state.findIndex(
            (msg) =>
              msg._id.startsWith("temp-") &&
              msg.sender.userId === newMessage.sender.userId &&
              Math.abs(new Date(msg.createdAt).getTime() - serverTime) <
                10000 &&
              (msg.chatId === newMessage.chatId || newMessage.chatId === null),
          );
        }

        if (tempIndex >= 0) {
          console.log(
            `Found temp message at index ${tempIndex} to replace with server message: ${newMessage._id}`,
          );
          const updatedState = [...state];
          updatedState[tempIndex] = {
            ...newMessage,
            chatId: newMessage.chatId || chatId!,
          };
          return updatedState;
        }
      }

      console.log(
        `Could not find temp message for ${newMessage._id}, adding as new message`,
      );
      return [...state, newMessage];
    },
  );

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
      urls.forEach((url) => URL.revokeObjectURL(url));
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

  const debouncedMarkAsRead = useCallback(
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
    () => debounce(debouncedMarkAsRead, 1000),
    [debouncedMarkAsRead],
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

      // Update status to sending
      startTransition(() => {
        updateOptimisticMessage({
          ...message,
          status: StatusEnum.sending,
        });
      });

      const pendingMessageData = pendingSendMessages.current.get(messageId);
      if (!pendingMessageData) {
        toast.error("Cannot retry: message data lost");
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
        startTransition(() => {
          updateOptimisticMessage({
            ...message,
            attachments: message.attachments.map((attachment) => ({
              ...attachment,
              status: StatusEnum.failed,
            })),
            status: StatusEnum.failed,
          });
        });

        toast.error(
          error instanceof Error ? error.message : "Failed to send message",
        );
      }
    },
    [chatId, token, setMessages, cleanupAttachments, updateOptimisticMessage],
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

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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

      startTransition(() => {
        updateOptimisticMessage(optimisticMessage);
        setMessages((prev) => [...prev, optimisticMessage]);
      });

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
          chatId: response.chatId || chatId,
        };

        setMessages((prev) => {
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
        // Update with failure status
        startTransition(() => {
          updateOptimisticMessage({
            ...optimisticMessage,
            status: StatusEnum.failed,
            attachments: optimisticMessage.attachments?.map((attachment) => ({
              ...attachment,
              status: StatusEnum.failed,
            })),
          });
          setMessages((prev) => [
            ...prev,
            {
              ...optimisticMessage,
              status: StatusEnum.failed,
              attachments: optimisticMessage.attachments?.map((attachment) => ({
                ...attachment,
                status: StatusEnum.failed,
              })),
            },
          ]);
        });

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
      updateOptimisticMessage,
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
        startTransition(() => {
          updateOptimisticMessage({
            ...message,
            status: StatusEnum.deleting,
          });
          setMessages((prev) =>
            prev.map((message) =>
              message._id === messageId
                ? { ...message, status: StatusEnum.deleting }
                : message,
            ),
          );
        });
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
          updateOptimisticMessage({
            ...message,
            status: StatusEnum.sent,
          });
          setMessages((prev) =>
            prev.map((message) =>
              message._id === messageId
                ? { ...message, status: StatusEnum.sent }
                : message,
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
      updateOptimisticMessage,
      currentUserId,
    ],
  );

  const handleReactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      const requestId = `react-${messageId}-${emoji}-${Date.now()}`;
      if (pendingRequests.current.has(requestId)) return;
      pendingRequests.current.add(requestId);

      const message = messagesMap.current.get(messageId);
      if (message && currentUserId) {
        const updatedMessage = {
          ...message,
          reactions: message.reactions
            .filter(
              (reaction) =>
                !(
                  reaction.userId === currentUserId && reaction.emoji === emoji
                ),
            )
            .concat(
              message.reactions.some(
                (r) => r.userId === currentUserId && r.emoji === emoji,
              )
                ? []
                : [
                    {
                      emoji,
                      timestamp: new Date(),
                      userId: currentUserId,
                    },
                  ],
            ),
        };
        startTransition(() => {
          updateOptimisticMessage(updatedMessage);
          setMessages((prev) =>
            prev.map((message) =>
              message._id === messageId ? updatedMessage : message,
            ),
          );
        });
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

        pendingRequests.current.delete(requestId);
      } catch (error) {
        pendingRequests.current.delete(requestId);
        if (message) {
          startTransition(() => {
            updateOptimisticMessage({
              ...message,
              reactions: message.reactions.filter(
                (reaction) =>
                  !(
                    reaction.userId === currentUserId &&
                    reaction.emoji === emoji
                  ),
              ),
            });
            setMessages((prev) =>
              prev.map((message) =>
                message._id === messageId
                  ? {
                      ...message,
                      reactions: message.reactions.filter(
                        (reaction) =>
                          !(
                            reaction.userId === currentUserId &&
                            reaction.emoji === emoji
                          ),
                      ),
                    }
                  : message,
              ),
            );
          });
        }
        console.error("Reaction error:", error);
        toast.error("Failed to react to message");
      }
    },
    [chatId, setMessages, currentUserId, token, updateOptimisticMessage],
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

      const message = messagesMap.current.get(messageId);
      if (message) {
        startTransition(() => {
          updateOptimisticMessage({
            ...message,
            content,
            edited: { editedAt: new Date(), isEdited: true },
            status: StatusEnum.sending,
          });
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
        });
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

        // Update with server response
        setMessages((prev) =>
          prev.map((message) =>
            message._id === messageId ? response : message,
          ),
        );

        toast.success("Message edited");
      } catch (error) {
        if (message) {
          startTransition(() => {
            updateOptimisticMessage({
              ...message,
              status: StatusEnum.failed,
            });
            setMessages((prev) =>
              prev.map((message) =>
                message._id === messageId
                  ? { ...message, status: StatusEnum.failed }
                  : message,
              ),
            );
          });
        }

        toast.error(
          error instanceof Error ? error.message : "Failed to edit message",
        );
      }
    },
    [chatId, setMessages, token, updateOptimisticMessage],
  );

  // Mark messages as read with optimistic UI update
  const handleMarkAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!currentUserId || !chatId) return;

      const readAt = new Date();
      const toMark = new Set<string>();

      // Apply optimistic updates
      setMessages((prev) => {
        const updatedMessages = prev.map((message) => {
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
        });

        // For each updated message, also apply optimistic update
        updatedMessages.forEach((message) => {
          if (toMark.has(message._id)) {
            startTransition(() => {
              updateOptimisticMessage(message);
            });
          }
        });

        return updatedMessages;
      });

      const ids = messageIds.length ? messageIds : [...toMark];
      if (!ids.length) return;

      ids.forEach((id) => pendingReadMessages.current.add(id));
      debouncedMarkAsReadHandler(ids);
    },
    [
      chatId,
      currentUserId,
      setMessages,
      debouncedMarkAsReadHandler,
      updateOptimisticMessage,
    ],
  );

  // Handle pending read messages when component unmounts
  React.useEffect(() => {
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

  const handleCancelReply = useCallback(
    () => setReplyToMessage(undefined),
    [setReplyToMessage],
  );

  // Initialize messages from initialMessages prop if needed
  useEffect(() => {
    if (messages.length > 0 && messages.length === 0) {
      setMessages(messages);
    }
  }, [messages, messages.length, setMessages]);

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = optimisticMessages.find(
        (prevMessage) => prevMessage._id === messageId,
      );
      if (message) setReplyToMessage(message);
    },
    [optimisticMessages, setReplyToMessage],
  );

  const value = {
    messages,
    optimisticMessages,
    setMessages,
    replyToMessage,
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    handleEditMessage,
    handleMarkAsRead,
    retryFailedMessage,
    updateOptimisticMessage,
    handleCancelReply,
    handleReplyToMessage,
  };

  return (
    <ChatActionsContext.Provider value={value}>
      {children}
    </ChatActionsContext.Provider>
  );
};
