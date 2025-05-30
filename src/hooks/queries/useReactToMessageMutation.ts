import { useMutation } from "@tanstack/react-query";
import { updateReaction } from "@/services/chat-api";

export function useReactToMessageMutation() {
  return useMutation({
    mutationFn: updateReaction,
    onSuccess: () => {},
  });
}
