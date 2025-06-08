import { getUserFriends } from "@/actions/user";
import { queryKeys } from "@/lib/config";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/types/useReduxType";

export const useFetchFriendsQuery = () => {
  const userId = useAppSelector((state) => state.user.user?.id);
  return useQuery({
    enabled: !!userId,
    queryKey: queryKeys.friends.lists(),
    queryFn: async () => {
      const friends = await getUserFriends(userId!);
      return friends;
    },
  });
};
