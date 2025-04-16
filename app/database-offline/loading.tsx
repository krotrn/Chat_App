import { Skeleton } from "@/components/ui/skeleton";

export default function DatabaseOfflineLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center space-y-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-32 mt-4" />
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
    </div>
  );
}
