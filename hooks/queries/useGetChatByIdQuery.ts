import { getChatById } from "@/services/chat-api";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../useReduxType";

export const useGetChatIdQuery = (chatId: string) => {
  const token = useAppSelector((state) => state.user.token);
  return useQuery({
    enabled: !!chatId && !!token,
    queryKey: ["chat", chatId],
    queryFn: () => getChatById({ chatId, token: token! }),
  });
};
