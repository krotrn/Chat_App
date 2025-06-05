import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateGroupChat,
  addNewParticipantInGroupChat,
  removeParticipantFromGroupChat,
  leaveGroupChat,
} from "@/services/chat";
import { queryKeys } from "@/lib/config";
import { createGroup, deleteGroup } from "@/actions/userUtils";
import { useAppSelector } from "../useReduxType";

export function useCreateGroupChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.infinite(20) });
      queryClient.setQueryData(queryKeys.chats.detail(data._id), data);
    },
  });
}

export function useUpdateGroupChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroupChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.infinite(20) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupChat.detail(data._id),
      });
      queryClient.setQueryData(queryKeys.chats.detail(data._id), data);
    },
  });
}

export function useDeleteGroupChatMutation() {
  const queryClient = useQueryClient();
  const token = useAppSelector((state) => state.user.token);
  return useMutation({
    mutationFn: ({ chatId }: { chatId: string }) =>
      deleteGroup({ chatId, token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.infinite(20) });
    },
  });
}

export function useAddParticipantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addNewParticipantInGroupChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.infinite(20) });
      queryClient.setQueryData(queryKeys.groupChat.detail(data._id), data);
    },
  });
}

export function useRemoveParticipantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeParticipantFromGroupChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.infinite(20) });
      queryClient.setQueryData(queryKeys.groupChat.detail(data._id), data);
    },
  });
}

export function useLeaveGroupChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveGroupChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.infinite(20) });
      queryClient.setQueryData(queryKeys.groupChat.detail(data._id), data);
    },
  });
}
