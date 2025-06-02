import { checkDB } from "@/actions/checks";
import { useQuery } from "@tanstack/react-query";

export const useCheckDBQuery = () => {
  return useQuery({
    queryFn: checkDB,
    queryKey: ["checkDB"],
    staleTime: 5000,
    refetchInterval: 5000,
  })
}