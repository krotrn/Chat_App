import { useQuery } from "@tanstack/react-query";
import { fetchChats } from "@/services/chat-api";
import { useAppSelector } from "../useReduxType";

export function useChatsQuery(options?: { limit?: number; page?: number }) {
  const token = useAppSelector((state) => state.user.token);
  return useQuery({
    queryKey: ["chats", options?.page, options?.limit],
    queryFn: () => fetchChats(token!, options?.limit, options?.page),
    enabled: !!token,
    staleTime:1000 * 30,
  });
}
