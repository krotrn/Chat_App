import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";

export function ProfileGlanceSkeleton() {
  return (
    <Card className="w-full min-w-fit justify-items-center">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
