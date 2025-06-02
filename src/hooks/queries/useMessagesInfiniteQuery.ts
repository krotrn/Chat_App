import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMessages } from "@/services/message";
import { useAppSelector } from "@/hooks/useReduxType";
import { queryKeys } from "@/lib/config";

export function useMessagesInfiniteQuery(chatId: string, limit = 20) {
  const token = useAppSelector((state) => state.user.token);
  return useInfiniteQuery({
    enabled: !!chatId && !!token,
    queryKey: queryKeys.messages.infinite(chatId, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      getAllMessages({ chatId, page: pageParam, limit, token: token! }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
}
