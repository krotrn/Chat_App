"use client";
import { DatabaseOfflinePage } from "@/components";
import { useCheckDBQuery } from "@/hooks";

export function DatabaseCheckWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useCheckDBQuery();

  if (isLoading) {
    return <>{children}</>;
  }

  if (!data) {
    return <DatabaseOfflinePage />;
  }

  return <>{children}</>;
}
