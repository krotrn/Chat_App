import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "../ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

interface ChatSideBarSkeletonProps {
  count?: number;
}

export default function ChatSideBarSkeleton({
  count = 5,
}: ChatSideBarSkeletonProps) {
  return (
    <div className="flex h-full w-full md:w-80 flex-col border-r">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search chats..." className="pl-8" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1">
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
