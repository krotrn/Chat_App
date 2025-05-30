"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Button } from "@/components/ui/button";
import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        router.refresh();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          You&apos;re Offline
        </h1>

        <p className="text-muted-foreground">
          It looks like you&apos;ve lost your internet connection. Please check
          your connection and try again.
        </p>

        <Button
          onClick={handleRefresh}
          className="w-full"
          disabled={!isOnline || isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing
            ? "Refreshing..."
            : isOnline
              ? "Reconnecting..."
              : "Try Again"}
        </Button>
      </div>
    </div>
  );
}
