import { Skeleton } from "@/components/ui/skeleton";

export default function OfflineLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-lg border">
        <div className="flex justify-center">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        
        <Skeleton className="h-8 w-3/4 mx-auto" />
        
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}