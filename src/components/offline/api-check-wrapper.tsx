"use client";
import { ApiOfflinePage } from "@/components/offline/pages/api-offline-page";
import { useConnectionHealthQuery } from "@/hooks/queries/useConnectionHealthQuery";

export default function APICheckWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useConnectionHealthQuery();

  if (isLoading) {
    return <>{children}</>;
  }

  if (!data) {
    return <ApiOfflinePage />;
  }

  return <>{children}</>;
}
