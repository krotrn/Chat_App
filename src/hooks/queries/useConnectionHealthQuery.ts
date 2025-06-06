import { useQuery } from "@tanstack/react-query";
import { checkConnectionHealth } from "@/services/api-client";

export function useConnectionHealthQuery() {
  return useQuery({
    queryKey: ["connectionHealth"],
    queryFn: checkConnectionHealth,
    staleTime: 5000,
    refetchInterval: 5000,
  });
}
