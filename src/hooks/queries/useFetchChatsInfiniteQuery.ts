import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchChats } from "@/services/chat-api";
import { useAppSelector } from "@/hooks/useReduxType";
import { queryKeys } from "@/lib/config";

export function useFetchChatsInfiniteQuery(limit = "20") {
  const token = useAppSelector((state) => state.user.token);
  return useInfiniteQuery({
    queryKey: queryKeys.chats.infinite(Number(limit)),
    enabled: !!token,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      fetchChats(token!, Number(limit), pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
}
