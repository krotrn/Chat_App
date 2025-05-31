import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteMessage } from "@/services/chat-api";
import { queryKeys } from "@/lib/config";
import { MessagesPageData } from "@/types/ChatType";

export function useDeleteMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    onMutate: async (variable) => {
      const { messageId, chatId } = variable;
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.infinite(chatId, 20),
      });

      const previousMessages = queryClient.getQueryData(
        queryKeys.messages.infinite(chatId, 20),
      );

      queryClient.setQueryData<InfiniteData<MessagesPageData>>(
        queryKeys.messages.infinite(chatId, 20),
        (old) => {
          if (!old) return;

          const newPages = old.pages.map((page: MessagesPageData) => ({
            ...page,
            messages: page.messages.filter(
              (message) => message._id !== messageId,
            ),
          }));
          return { ...old, pages: newPages };
        },
      );
      return { previousMessages };
    },
    onError: (error, variable, context) => {
      console.error("Error deleting message:", error);
      if (!context) return;
      queryClient.setQueryData(
        queryKeys.messages.infinite(variable.chatId, 20),
        context.previousMessages,
      );
    },
  });
}
