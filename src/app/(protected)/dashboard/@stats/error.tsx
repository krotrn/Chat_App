"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

export default function StatsError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Stats error:", error);
  }, [error]);
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex items-center">
        <CardTitle className="text-red-500">Network Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-x-4 h-10 flex items-center justify-center">
          <WifiOff />
          <p className="text-red-500">Refresh the Page.</p>
        </div>
      </CardContent>
    </Card>
  );
}
