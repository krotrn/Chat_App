import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMessages } from "@/services/chat-api";
import { useAppSelector } from "../useReduxType";

export function useMessagesInfiniteQuery(chatId: string, limit = 20) {
  const token = useAppSelector((state) => state.user.token);
  return useInfiniteQuery({
    enabled: !!chatId && !!token,
    queryKey: ["messages-infinite", chatId, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getAllMessages({ chatId, page: pageParam, limit, token: token! }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}
