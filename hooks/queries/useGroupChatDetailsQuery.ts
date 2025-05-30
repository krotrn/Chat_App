import { useQuery } from "@tanstack/react-query";
import { getGroupChatDetails } from "@/services/chat-api";
import { useAppSelector } from "../useReduxType";

export function useGroupChatDetailsQuery(chatId: string) {
  const token = useAppSelector((state) => state.user.token);
  return useQuery({
    enabled: !!chatId && !!token,
    queryKey: ["groupChatDetails", chatId],
    queryFn: () => getGroupChatDetails({ chatId, token: token! }),
  });
}
