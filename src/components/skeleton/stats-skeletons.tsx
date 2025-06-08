import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

export function StatsSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={cn(className, "w-full")}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
            <Skeleton className="h-8 w-8 mb-2 rounded-full" />
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
            <Skeleton className="h-8 w-8 mb-2 rounded-full" />
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
