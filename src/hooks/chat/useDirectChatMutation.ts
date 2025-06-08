import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrGetAOneOnOneChat, deleteOneOnOneChat } from "@/services/chat";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setCurrentChat } from "@/lib/redux/slices/current-chat-slice";
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
  const token = useAppSelector((state) => state.user.token);
  return useMutation({
    mutationFn: ({
      chatId,
      forEveryone,
    }: {
      chatId: string;
      forEveryone: boolean;
    }) => deleteOneOnOneChat({ chatId, token: token!, forEveryone }),
    onSuccess: (data, variables) => {
      dispatch(setCurrentChat(null));
      queryClient.removeQueries({
        queryKey: queryKeys.chats.detail(variables.chatId),
      });
    },
  });
}
