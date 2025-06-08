"use client";
import { DatabaseOfflinePage } from "@/components/offline/pages/database-offline-page";
import { useCheckDBQuery } from "@/hooks/system";

export default function DatabaseCheckWrapper({
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
