import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrGetAOneOnOneChat,
  deleteOneOnOneChat,
} from "@/services/chat";
import { useAppDispatch } from "@/hooks/useReduxType";
import { setCurrentChat } from "@/lib/redux/slices/chat-slice";
import { queryKeys } from "@/lib/config";
import { useRouter } from "next/navigation";

export function useCreateDirectChatMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: createOrGetAOneOnOneChat,
    onSuccess: (data) => {
      dispatch(setCurrentChat(data));
      queryClient.setQueryData(queryKeys.chats.detail(data._id), data);
      router.push(`/chats?chat=${data._id}`);
    },
  });
}

export function useDeleteDirectChatMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOneOnOneChat,
    onSuccess: (data, variables) => {
      dispatch(setCurrentChat(null));
      queryClient.removeQueries({
        queryKey: queryKeys.chats.detail(variables.chatId),
      });
    },
  });
}
