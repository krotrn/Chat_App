import MessageListSkeleton from "@/components/skeleton/message-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatMainLoading() {
  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      {/* Message Header */}
      <div className="flex h-16 w-full items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      {/* Message List */}
      <div className="flex flex-1 h-screen overflow-hidden">
        <div className="flex flex-1 flex-col">
          <MessageListSkeleton />
        </div>
      </div>
    </div>
  );
}
