"use client";
import { useState, useEffect } from "react";
import { useDatabaseStatus } from "@/hooks/use-database-status";
import { DatabaseOfflinePage } from "./database-offline-page";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useApiStatus } from "@/hooks/use-api-status";
import OfflinePage from "./offline-page";
import { ApiOfflinePage } from "./api-offline-page";

interface CheckWrapperProps {
  children: React.ReactNode;
}

export default function CheckWrapper({ children }: CheckWrapperProps) {
  const isOnline = useOnlineStatus();
  const { isConnected: isDatabaseConnected, isChecking: isDatabaseChecking } = useDatabaseStatus();
  const { isConnected: isApiConnected, isChecking: isApiChecking } = useApiStatus();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isDatabaseChecking || isApiChecking) {
    return <>{children}</>;
  }

  if (!isOnline) {
    return <OfflinePage />;
  }
  
  if (!isApiConnected) {
    return <ApiOfflinePage />;
  }
  
  if (!isDatabaseConnected) {
    return <DatabaseOfflinePage />;
  }

  return <>{children}</>;
}
