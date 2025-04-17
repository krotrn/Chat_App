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

  const revokeAttachmentBlobUrls = useCallback((message: MessageType) => {
    if (message?.attachments?.length) {
      message.attachments.forEach((attachment) => {
        if (attachment.url?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(attachment.url);
            console.log(`Revoked blob URL for attachment: ${attachment.name}`);
          } catch (e) {
            console.error(
              `Failed to revoke blob URL for attachment: ${attachment.name}`,
              e,
            );
          }
        }
      });
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyToId?: string) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        toast.error("Message cannot be empty");
        return;
      }
      if (!chatId) {
        toast.error("No chat ID provided");
        return;
      }
      const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`Creating optimistic message with ID: ${optimisticId}`);

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
        status: StatusEnum.sending,
        reactions: [],
        receivers: [],
        attachments: attachments
          ? attachments.map((file) => ({
              name: file.name,
              url: URL.createObjectURL(file),
              type: file.type,
              localPath: file.name,
              status: StatusEnum.sending,
            }))
          : [],
        edited: {
          isEdited: false,
          editedAt: new Date(),
        },
        edits: [],
        readBy: [],
        deletedFor: [],
        formatting: {},
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
        console.log(`Sending message to API for chat ${chatId}:`, {
          content,
          hasAttachments: !!attachments?.length,
          replyToId: replyToId || null,
        });

        const response = await sendMessage({
          chatId,
          content,
          attachments,
          replyToId,
        });

        console.log(`Message sent successfully, received response:`, response);

        if (response) {
          pendingSendMessages.current.delete(optimisticId);

          setMessages((prev) => {
            const realMessageExists = prev.some(
              (msg) => msg._id === response._id,
            );
            if (realMessageExists) {
              console.log(
                `Real message ${response._id} already exists in state, removing optimistic version`,
              );
              const optimisticMessage = prev.find(
                (msg) => msg._id === optimisticId,
              );
              if (optimisticMessage) {
                revokeAttachmentBlobUrls(optimisticMessage);
              }
              return prev.filter((msg) => msg._id !== optimisticId);
            }

            const optimisticMessageExists = prev.some(
              (msg) => msg._id === optimisticId,
            );

            if (!optimisticMessageExists) {
              console.log(
                `Message ${optimisticId} not found in state, adding response directly`,
              );
              return [...prev, response];
            }

            return prev.map((msg) => {
              if (msg._id === optimisticId) {
                console.log(
                  `Replacing optimistic message ${optimisticId} with server message ${response._id}`,
                );
                revokeAttachmentBlobUrls(msg);
                return response;
              }
              return msg;
            });
          });
        } else {
          console.error("Empty response received from server");
          throw new Error("Failed to send message: empty response from server");
        }
      } catch (error) {
        console.error("Failed to send message:", error);

        startTransition(() => {
          setMessages((prev) => {
            const messageExists = prev.some((msg) => msg._id === optimisticId);

            if (!messageExists) {
              console.log(
                `Failed message ${optimisticId} not found in state, can't update status`,
              );
              return prev;
            }

            return prev.map((msg) => {
              if (msg._id === optimisticId) {
                console.log(`Marking message ${optimisticId} as failed`);
                return {
                  ...msg,
                  status: StatusEnum.failed,
                  attachments: msg.attachments?.map((att) => ({
                    ...att,
                    status: StatusEnum.failed,
                  })),
                };
              }
              return msg;
            });
          });
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
      revokeAttachmentBlobUrls,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      let deletedMessage: MessageType | undefined;

      setMessages((prev) => {
        deletedMessage = prev.find((msg) => msg._id === messageId);
        return prev.filter((msg) => msg._id !== messageId);
      });

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

        if (deletedMessage) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg._id === messageId);
            if (!exists) {
              return [...prev, deletedMessage!];
            }
            return prev;
          });
        }

        toast.error(
          error instanceof Error && error.message
            ? error.message
            : "Failed to delete message",
        );
      }
    },
    [chatId, replyToMessage, setReplyToMessage, setMessages],
  );

  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      setMessages((prev) => {
        const existingMessage = prev.find((msg) => msg._id === messageId);
        if (!existingMessage) return prev;

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

      const readAt = new Date();
      const messagesToMark = new Set<string>();

      setMessages((prev) => {
        const updatedMessages = prev.map((msg) => {
          if (
            (!messageIds || messageIds.includes(msg._id)) &&
            msg.sender.userId !== currentUserId &&
            (!msg.readBy || !msg.readBy.some((r) => r.userId === currentUserId))
          ) {
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

      messageIds?.forEach((id) => pendingReadMessages.current.add(id));

      const idsToMark = messageIds || Array.from(messagesToMark);
      if (idsToMark.length === 0) return;

      try {
        await markMessagesAsRead({
          chatId,
          messageIds: idsToMark,
        });

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

  useEffect(() => {
    if (chatId && currentUserId) {
      handleMarkAsRead();
    }

    const currentChatId = chatId;
    const pendingMessages = pendingReadMessages.current;

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
