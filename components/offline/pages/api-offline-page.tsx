"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, ServerOff } from "lucide-react";
import { config } from "@/config";
import Link from "next/link";
import { checkConnectionHealth } from "@/services/chat-api";

export function ApiOfflinePage() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [reconnectInterval, setReconnectInterval] = useState(2000); // Start with 2 seconds

  const checkConnection = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const isHealthy = await checkConnectionHealth();
      if (isHealthy) {
        window.location.reload();
        return true;
      } else {
        // Implement exponential backoff with a maximum interval
        const newInterval = Math.min(reconnectInterval * 1.5, 30000); // Max 30 seconds
        setReconnectInterval(newInterval);
        setReconnectAttempts((prev) => prev + 1);
        setIsRefreshing(false);
        return false;
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setIsRefreshing(false);
      return false;
    }
  }, [reconnectInterval]);

  useEffect(() => {
    setIsRefreshing(false);

    // Initial check
    checkConnection();

    // Progressive interval checks with exponential backoff
    let intervalId: NodeJS.Timeout | null = null;

    const setupNextCheck = () => {
      intervalId = setTimeout(async () => {
        const success = await checkConnection();
        if (!success) {
          setupNextCheck();
        }
      }, reconnectInterval);
    };

    setupNextCheck();

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [reconnectInterval, router, checkConnection]);

  const handleRefresh = async () => {
    // Reset the interval on manual refresh
    setReconnectInterval(2000);
    await checkConnection();
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
          due to server maintenance or the server restarting after inactivity.
          We&apos;ll automatically reconnect when the server is available.
        </p>
        {reconnectAttempts > 0 && (
          <p className="text-sm text-muted-foreground">
            Reconnection attempts: {reconnectAttempts}
          </p>
        )}
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="mt-4"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Checking Connection..." : "Try Again Now"}
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
