import { removeFriend } from "@/actions/user";
import { queryKeys } from "@/lib/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveFriendMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, friendId }: { userId?: string; friendId: string }) =>
      removeFriend(userId!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.lists() });
    },
  });
}
