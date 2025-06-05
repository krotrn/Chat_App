import { sendFriendRequest } from "@/actions/userUtils";
import { useMutation } from "@tanstack/react-query";

export function useSendRequestMutation() {
  return useMutation({
    mutationFn: sendFriendRequest,
  });
}
