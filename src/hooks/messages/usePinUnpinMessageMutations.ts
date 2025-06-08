import { useMutation } from "@tanstack/react-query";
import { pinMessage, unpinMessage } from "@/services/message";

export function usePinMessageMutation() {
  return useMutation({ mutationFn: pinMessage });
}

export function useUnpinMessageMutation() {
  return useMutation({ mutationFn: unpinMessage });
}
