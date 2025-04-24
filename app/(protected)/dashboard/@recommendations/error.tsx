"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

export default function RecommendationsError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Recommendations error:", error);
  }, [error]);
  return (
    <Card className="flex items-center justify-center flex-col">
      <CardHeader>
        <CardTitle className="text-red-500">Network Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-x-4 h-24 flex items-center justify-center">
          <WifiOff />
          <p className="text-red-500">Refresh the Page.</p>
        </div>
      </CardContent>
    </Card>
  );
}
