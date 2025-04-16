"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function OfflineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Offline page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold tracking-tight text-red-500">
          Something went wrong!
        </h1>

        <p className="text-muted-foreground">
          There was an error loading the offline page. Please try again.
        </p>

        <Button onClick={reset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
