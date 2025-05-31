import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { updateReaction } from "@/services/chat-api";
import { queryKeys } from "@/lib/config";
import { MessagesPageData, MessageType } from "@/types/ChatType";
import { useAppSelector } from "@/hooks/useReduxType";

export function useReactToMessageMutation() {
  const queryClient = useQueryClient();
  const userId = useAppSelector((state) => state.user.user?.id)!;
  return useMutation({
    mutationFn: updateReaction,
    onMutate: async (variable) => {
      const { messageId, chatId, emoji } = variable;
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
          const newPages = old.pages.map((page) => {
            const newMessages: MessageType[] = page.messages.map((message) => {
              if (message._id !== messageId) return message;

              const existingReaction = message.reactions.find(
                (reaction) => reaction.userId === userId,
              );
              if (existingReaction) {
                if (existingReaction.emoji === emoji) {
                  return {
                    ...message,
                    reactions: message.reactions.filter(
                      (reaction) => reaction.userId !== userId,
                    ),
                  };
                }
                return {
                  ...message,
                  reactions: message.reactions.map((reaction) => {
                    if (reaction.userId === userId) {
                      return { ...reaction, emoji, timestamp: new Date() };
                    }
                    return reaction;
                  }),
                };
              }
              return {
                ...message,
                reactions: [
                  ...message.reactions,
                  { emoji, userId, timestamp: new Date() },
                ],
              };
            });
            return { ...page, messages: newMessages };
          });
          return { ...old, pages: newPages };
        },
      );
      return { previousMessages };
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.infinite(variables.chatId, 20),
          context.previousMessages,
        );
      }
    },
    onSuccess: () => {
      console.log("Reaction updated successfully");
    },
  });
}
