import { searchPeople } from "@/actions/userUtils";
import { useMutation } from "@tanstack/react-query";

export const useFriendSearchQuery = () => {
  return useMutation({
    mutationFn: searchPeople,
  });
};
