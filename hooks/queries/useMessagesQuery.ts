import { useQuery } from "@tanstack/react-query";
import { getAllMessages } from "@/services/chat-api";

export function useMessagesQuery(
  chatId: string,
  options?: { page?: number; limit?: number; before?: string; after?: string },
) {
  return useQuery({
    enabled: !!chatId,
    queryKey: [
      "messages",
      chatId,
      options?.page,
      options?.limit,
      options?.before,
      options?.after,
    ],
    queryFn: () => getAllMessages({ chatId, ...options }),
  });
}
