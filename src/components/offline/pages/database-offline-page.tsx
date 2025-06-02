"use client";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { config } from "@/config";
import Link from "next/link";
import { useCheckDBQuery } from "@/hooks/queries/useCheckDBQuery";

export function DatabaseOfflinePage() {
  const { data, isLoading, refetch } = useCheckDBQuery();
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isLoading && data) {
      window.location.reload();
    }
  }, [data, isLoading]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-muted p-4">
          <Database className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Database Connection Lost
        </h1>
        <p className="text-muted-foreground">
          We&apos;re having trouble connecting to our database. This might be
          due to maintenance or a temporary issue. Please try again in a few
          moments.
        </p>
        <Button onClick={handleRefresh} disabled={isLoading} className="mt-4">
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Checking Connection..." : "Try Again"}
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
