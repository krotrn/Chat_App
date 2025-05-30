"use client";
import { useEffect, useState } from "react";
import { DatabaseOfflinePage } from "@/components/offline/pages/database-offline-page";
import { useDatabaseStatus } from "@/hooks/use-database-status";

export default function DatabaseCheckWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected: isDatabaseConnected, isChecking: isDatabaseChecking } =
    useDatabaseStatus();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isDatabaseChecking) {
    return <>{children}</>;
  }

  if (!isDatabaseConnected) {
    return <DatabaseOfflinePage />;
  }

  return <>{children}</>;
}
