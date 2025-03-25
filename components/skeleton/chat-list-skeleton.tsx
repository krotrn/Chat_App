import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "../ui/scroll-area";

interface ChatListSkeletonProps {
  count?: number;
}

export default function ChatListSkeleton({ count = 5 }: ChatListSkeletonProps) {
  return (
    <div className="flex h-full w-full md:w-80 flex-col border-r">
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
