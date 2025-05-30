import { useQuery } from "@tanstack/react-query";
import { getAllMessages } from "@/services/chat-api";
import { useAppSelector } from "../useReduxType";

export function useMessagesQuery(
  chatId: string,
  options?: { page?: number; limit?: number; before?: string; after?: string },
) {
  const token = useAppSelector((state) => state.user.token);
  return useQuery({
    enabled: !!chatId && !!token,
    queryKey: [
      "messages",
      chatId,
      options?.page,
      options?.limit,
      options?.before,
      options?.after,
    ],
    queryFn: () => getAllMessages({ chatId, token: token!, ...options }),
  });
}
