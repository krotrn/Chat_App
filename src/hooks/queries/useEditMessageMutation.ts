import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { editMessage } from "@/services/chat-api";
import { queryKeys } from "@/lib/config";
import { ChatType, MessagesPageData, MessageType } from "@/types/ChatType";

export function useEditMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editMessage,
    onMutate: async (variable) => {
      const { messageId, chatId, content } = variable;

      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.infinite(chatId, 20),
      });

      const previousMessages = queryClient.getQueryData<
        InfiniteData<MessagesPageData>
      >(queryKeys.messages.infinite(chatId, 20));

      queryClient.setQueryData<InfiniteData<MessagesPageData>>(
        queryKeys.messages.infinite(chatId, 20),
        (old) => {
          if (!old) return;
          const newPages = old.pages.map((page: MessagesPageData) => ({
            ...page,
            messages: page.messages.map((message: MessageType) => {
              if (message._id === messageId) {
                return { ...message, content };
              }
              return message;
            }),
          }));
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
                if (chat.lastMessage) {
                  return {
                    ...chat,
                    lastMessage: {
                      ...chat.lastMessage,
                      content,
                      edited: {
                        isEdited: true,
                        editedAt: new Date(),
                      },
                      edits: [
                        ...(chat.lastMessage.edits || []),
                        {
                          content: chat.lastMessage.content,
                          editedAt: new Date(),
                          sender: chat.lastMessage.sender,
                          editedBy: chat.lastMessage.sender.userId,
                        },
                      ],
                    },
                  };
                }
              }
              return chat;
            }),
          }));
          return { ...old, pages: newChats };
        },
      );
      return { previousMessages };
    },

    onError: (error, variable, context) => {
      if (!context) return;
      queryClient.setQueryData<InfiniteData<MessagesPageData>>(
        queryKeys.messages.infinite(variable.chatId, 20),
        context.previousMessages,
      );
    },
  });
}
