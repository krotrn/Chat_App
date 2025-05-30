import { useMutation } from "@tanstack/react-query";
import { markMessagesAsRead } from "@/services/chat-api";

export function useMarkAsReadMutation() {
  return useMutation({
    mutationFn: markMessagesAsRead,
  });
}
