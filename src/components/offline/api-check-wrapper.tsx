"use client";
import { ApiOfflinePage } from "@/components";
import { useConnectionHealthQuery } from "@/hooks";

export function APICheckWrapper({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useConnectionHealthQuery();

  if (isLoading) {
    return <>{children}</>;
  }

  if (!data) {
    return <ApiOfflinePage />;
  }

  return <>{children}</>;
}
