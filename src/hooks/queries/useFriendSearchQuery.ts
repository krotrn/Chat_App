import { searchPeople } from "@/actions/user";
import { useMutation } from "@tanstack/react-query";

export const useFriendSearchQuery = () => {
  return useMutation({
    mutationFn: ({ contains }: { contains: string }) => {
      return searchPeople({ contains });
    },
  });
};
