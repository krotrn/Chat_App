import { useMutation } from "@tanstack/react-query";
import { markMessagesAsRead } from "@/services/message";

export function useMarkAsReadMutation() {
  return useMutation({
    mutationFn: markMessagesAsRead,
  });
}
