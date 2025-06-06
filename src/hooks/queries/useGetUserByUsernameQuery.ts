import { getUserDataByUsername } from "@/actions/userUtils";
import { queryKeys } from "@/lib/config";
import { useQuery } from "@tanstack/react-query";

export function useGetUserByUsernameQuery(username: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.detail(username!),
    queryFn: () => getUserDataByUsername(username!),
    enabled: !!username,
  });
}
