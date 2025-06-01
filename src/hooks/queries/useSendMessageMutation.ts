import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { sendMessage } from "@/services/chat-api";
import {
  ChatType,
  MessagesPageData,
  MessageType,
  StatusEnum,
} from "@/types/ChatType";
import { queryKeys } from "@/lib/config";
import { useAppSelector } from "@/hooks/useReduxType";

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  const sender = useAppSelector((state) => state.user.user!);
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (variable) => {
      const { chatId, content, replyToId } = variable;
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.infinite(chatId, 20),
      });
      const previousMessages = queryClient.getQueryData(
        queryKeys.messages.infinite(chatId, 20),
      );
      const optimisticMessage: MessageType = {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chatId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        reactions: [],
        replyToId: replyToId,
        sender: {
          avatarUrl: sender.avatarUrl || "",
          userId: sender.id!,
          name: sender.name || sender.username,
        },
        receivers: [],
        attachments: [],
        status: StatusEnum.SENDING,
        isPinned: false,
        edited: {
          isEdited: false,
          editedAt: new Date(),
        },
        edits: [],
        readBy: [],
        deletedFor: [],
      };
      queryClient.setQueryData<InfiniteData<MessagesPageData>>(
        queryKeys.messages.infinite(chatId, 20),
        (old) => {
          if (!old) return;
          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              messages: [optimisticMessage, ...newPages[0].messages],
            };
          }
          return { ...old, pages: newPages };
        },
      );
      queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
        queryKeys.chats.infinite(20),
        (old) => {
          if (!old) return;
          const newChats = old.pages.map((page) => ({
            ...page,
            chats: page.chats.map((chat) => {
              if (chat._id === chatId) {
                return {
                  ...chat,
                  lastMessage: optimisticMessage,
                };
              }
              return chat;
            }),
          }));
          return { ...old, pages: newChats };
        },
      );
      return { previousMessages, optimisticMessage };
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.infinite(variables.chatId, 20),
          context.previousMessages,
        );
      }
      console.error("Error sending message:", error);
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<InfiniteData<MessagesPageData>>(
        queryKeys.messages.infinite(variables.chatId, 20),
        (old) => {
          if (!old || !context?.optimisticMessage) return old;

          // Check if the real message already exists (WebSocket might have already handled it)
          const realMessageExists = old.pages.some((page) =>
            page.messages.some((msg) => msg._id === data._id),
          );

          if (realMessageExists) {
            // WebSocket already handled this message, remove the optimistic one if it still exists
            const newPages = old.pages.map((page) => ({
              ...page,
              messages: page.messages.filter(
                (msg) => msg._id !== context.optimisticMessage._id,
              ),
            }));
            return { ...old, pages: newPages };
          }

          // Replace optimistic message with real message
          const newPages = old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((msg) =>
              msg._id === context.optimisticMessage._id ? data : msg,
            ),
          }));
          return { ...old, pages: newPages };
        },
      );

      // Update the last message in chats list
      queryClient.setQueryData<InfiniteData<{ chats: ChatType[] }>>(
        queryKeys.chats.infinite(20),
        (old) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            chats: page.chats.map((chat) => {
              if (chat._id === variables.chatId) {
                return {
                  ...chat,
                  lastMessage: data,
                };
              }
              return chat;
            }),
          }));
          return { ...old, pages: newPages };
        },
      );

      // No need to invalidate since we're updating optimistically
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.messages.infinite(variables.chatId, 20),
      //   refetchType: "active",
      // });
    },
  });
}
