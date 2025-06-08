"use client";
import { useEffect, useState } from "react";
import { OfflinePage } from "@/components";
import { useOnlineStatus } from "@/hooks";

export function OnlineCheckWrapper({
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
