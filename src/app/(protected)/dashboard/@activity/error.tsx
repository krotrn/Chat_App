"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

export default function ActivityError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Activity error:", error);
  }, [error]);
  return (
    <Card className="flex items-center justify-center flex-col">
      <CardHeader>
        <CardTitle className="text-red-500">Network Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-16 space-x-2 flex items-center justify-center">
          <WifiOff />
          <p className="text-red-500">Refresh the Page.</p>
        </div>
      </CardContent>
    </Card>
  );
}
