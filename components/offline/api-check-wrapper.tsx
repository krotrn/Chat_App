"use client";
import { useEffect, useState } from "react";
import { ApiOfflinePage } from "@/components/offline/pages/api-offline-page";
import { useApiStatus } from "@/hooks/use-api-status";

export default function APICheckWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected: isApiConnected, isChecking: isApiChecking } =
    useApiStatus();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isApiChecking) {
    return <>{children}</>;
  }

  if (!isApiConnected) {
    return <ApiOfflinePage />;
  }

  return <>{children}</>;
}
