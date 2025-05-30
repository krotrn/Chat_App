import { useMutation } from "@tanstack/react-query";
import { deleteMessage } from "@/services/chat-api";

export function useDeleteMessageMutation() {

  return useMutation({
    mutationFn: deleteMessage,
    onError: (error) => {
      console.error("Error deleting message:", error);
    },
  });
}
