import { useQuery } from "@tanstack/react-query";
import { getGroupChatDetails } from "@/services/chat";
import { useAppSelector } from "@/hooks";
import { queryKeys } from "@/lib/config";

export function useGroupChatDetailsQuery(chatId: string) {
  const token = useAppSelector((state) => state.user.token);
  return useQuery({
    enabled: !!chatId && !!token,
    queryKey: queryKeys.groupChat.detail(chatId),
    queryFn: () => getGroupChatDetails({ chatId, token: token! }),
  });
}
