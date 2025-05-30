import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RequestSkeleton from "@/components/skeleton/request-skeleton";

export default function RequestListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RequestSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
