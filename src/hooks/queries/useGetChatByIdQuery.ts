import { getChatById } from "@/services/chat";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useReduxType";
import { queryKeys } from "@/lib/config";

export const useGetChatIdQuery = (chatId: string) => {
  const token = useAppSelector((state) => state.user.token);
  return useQuery({
    enabled: !!chatId && !!token,
    queryKey: queryKeys.chats.detail(chatId),
    queryFn: () => getChatById({ chatId, token: token! }),
  });
};
