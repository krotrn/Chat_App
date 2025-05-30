import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editMessage } from "@/services/chat-api";

export function useEditMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });
    },
  });
}
