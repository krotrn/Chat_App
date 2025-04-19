"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, ServerOff } from "lucide-react";
import { config } from "@/config";
import Link from "next/link";
import { checkConnectionHealth } from "@/services/chat-api";

export function ApiOfflinePage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsRefreshing(false);
    
    // Check connection status immediately
    const checkConnection = async () => {
      const isHealthy = await checkConnectionHealth();
      if (isHealthy) {
        router.refresh();
      }
    };
    
    checkConnection();
    
    // Setup interval to keep checking
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, [router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const isHealthy = await checkConnectionHealth();
    
    if (isHealthy) {
      router.refresh();
    } else {
      setTimeout(() => { setIsRefreshing(false); }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <ServerOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Chat Server Connection Lost
        </h1>
        <p className="text-muted-foreground">
          We&apos;re having trouble connecting to our chat server. This might be
          due to server maintenance or a temporary issue. Please try again in a few
          moments.
        </p>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="mt-4"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Checking Connection..." : "Try Again"}
        </Button>
        {config.supportEmail && (
          <p className="text-xs text-muted-foreground">
            If the problem persists, please contact support at{" "}
            <Link
              href={`mailto:${config.supportEmail}`}
              className="underline underline-offset-4 hover:text-primary"
            >
              {config.supportEmail}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}