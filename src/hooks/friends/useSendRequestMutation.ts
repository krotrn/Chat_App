import { sendFriendRequest } from "@/actions/user";
import { useMutation } from "@tanstack/react-query";

export function useSendRequestMutation() {
  return useMutation({
    mutationFn: sendFriendRequest,
  });
}
