import { useQuery } from "@tanstack/react-query";
import { getGroupChatDetails } from "@/services/chat-api";

export function useGroupChatDetailsQuery(chatId: string) {
  return useQuery({
    enabled: !!chatId,
    queryKey: ["groupChatDetails", chatId],
    queryFn: () => getGroupChatDetails({ chatId }),
  });
}
