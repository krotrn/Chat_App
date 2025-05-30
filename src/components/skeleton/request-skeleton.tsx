import { Skeleton } from "@/components/ui/skeleton";

export default function RequestSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 self-end sm:self-center">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
