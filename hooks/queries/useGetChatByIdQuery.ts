import { getChatById } from "@/services/chat-api";
import { useQuery } from "@tanstack/react-query";

export const useGetChatIdQuery = (chatId: string) => {
  return useQuery({
    enabled: !!chatId,
    queryKey: ["chat", chatId],
    queryFn: () => getChatById({ chatId }),
  });
};
