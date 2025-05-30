import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchChats } from "@/services/chat-api";

export function useFetchChatsInfiniteQuery(limit = "20") {
  return useInfiniteQuery({
    queryKey: ["chats-infinite", limit],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => fetchChats(limit, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}
