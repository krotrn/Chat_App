import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { sendMessage } from "@/services/chat-api";
import { MessagesPageData, MessageType, StatusEnum } from "@/types/ChatType";
import { queryKeys } from "@/lib/config";
import { useAppSelector } from "../useReduxType";

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
        queryKeys.messages.infinite(chatId, 20)
      );

      const optimisticMessage: MessageType = {
        _id: `temp-${Date.now()}`,
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
        }
      );
      return { previousMessages, optimisticMessage };
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.infinite(variables.chatId, 20),
          context.previousMessages
        );
      }
      console.error("Error sending message:", error);
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<InfiniteData<MessagesPageData>>(
        queryKeys.messages.infinite(variables.chatId, 20),
        (old) => {
          if (!old) return;
          const newPages = old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((msg) =>
              msg._id === context.optimisticMessage._id ? data : msg
            ),
          }));
          return { ...old, pages: newPages };
        }
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.infinite(variables.chatId, 20),
        refetchType: "active",
      });
    },
  });
}
