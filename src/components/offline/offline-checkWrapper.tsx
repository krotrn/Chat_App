"use client";
import { useEffect, useState } from "react";
import OfflinePage from "@/components/offline/pages/offline-page";
import { useOnlineStatus } from "@/hooks/use-online-status";

export default function OnlineCheckWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOnline = useOnlineStatus();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isOnline) {
    return <>{children}</>;
  }

  if (!isOnline) {
    return <OfflinePage />;
  }

  return <>{children}</>;
}
