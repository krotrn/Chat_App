import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrGetAOneOnOneChat,
  deleteOneOnOneChat,
} from "@/services/chat-api";
import { useAppDispatch } from "@/hooks/useReduxType";
import { setCurrentChat } from "@/lib/redux/slices/chat-slice";

export function useCreateDirectChatMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrGetAOneOnOneChat,
    onSuccess: (data) => {
      dispatch(setCurrentChat(data));
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    },
  });
}

export function useDeleteDirectChatMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOneOnOneChat,
    onSuccess: () => {
      dispatch(setCurrentChat(null));
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    },
  });
}
