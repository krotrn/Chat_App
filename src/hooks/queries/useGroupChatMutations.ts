import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAGroupChat,
  updateGroupChat,
  deleteGroupChat,
  addNewParticipantInGroupChat,
  removeParticipantFromGroupChat,
  leaveGroupChat,
} from "@/services/chat";
import { queryKeys } from "@/lib/config";
import { ParticipantsType } from "@/types/ChatType";

export function useCreateGroupChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:({ participants, name, token, }: {
    name: string;
    participants: ParticipantsType[];
    token: string;
    }) => {
      return createAGroupChat({ participants, name, token });
    },
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
  return useMutation({
    mutationFn: deleteGroupChat,
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
