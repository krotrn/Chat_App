import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/services/chat-api";

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onError: (error) => {
      console.error("Error sending message:", error);
    },
    onSuccess: () => {
      console.log("Message sent successfully");
      queryClient.invalidateQueries({
        queryKey: ["messages-infinite"],
        refetchType: "active",
      });
    },
  });
}
