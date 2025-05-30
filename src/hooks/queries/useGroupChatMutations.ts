import { useMutation } from "@tanstack/react-query";
import {
  createAGroupChat,
  updateGroupChat,
  deleteGroupChat,
  addNewParticipantInGroupChat,
  removeParticipantFromGroupChat,
  leaveGroupChat,
} from "@/services/chat-api";

export function useCreateGroupChatMutation() {
  return useMutation({ mutationFn: createAGroupChat });
}

export function useUpdateGroupChatMutation() {
  return useMutation({ mutationFn: updateGroupChat });
}

export function useDeleteGroupChatMutation() {
  return useMutation({ mutationFn: deleteGroupChat });
}

export function useAddParticipantMutation() {
  return useMutation({ mutationFn: addNewParticipantInGroupChat });
}

export function useRemoveParticipantMutation() {
  return useMutation({ mutationFn: removeParticipantFromGroupChat });
}

export function useLeaveGroupChatMutation() {
  return useMutation({ mutationFn: leaveGroupChat });
}
