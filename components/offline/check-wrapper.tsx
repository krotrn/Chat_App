"use client";
import { useState, useEffect } from "react";
import { useDatabaseStatus } from "@/hooks/use-database-status";
import { DatabaseOfflinePage } from "./database-offline-page";
import { useOnlineStatus } from "@/hooks/use-online-status";
import OfflinePage from "./offline-page";

interface CheckWrapperProps {
  children: React.ReactNode;
}

export default function CheckWrapper({ children }: CheckWrapperProps) {
  const isOnline = useOnlineStatus();
  const { isConnected, isChecking } = useDatabaseStatus();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  if (isChecking) {
    return <>{children}</>;
  }

  if (!isOnline) {
    return <OfflinePage />;
  }
  if (!isConnected) {
    return <DatabaseOfflinePage />;
  }

  return <>{children}</>;
}
