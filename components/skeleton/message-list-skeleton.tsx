import { Skeleton } from "@/components/ui/skeleton";

interface MessageListSkeletonProps {
  messageCount?: number;
}

export default function MessageListSkeleton({
  messageCount = 6,
}: MessageListSkeletonProps) {
  return (
    <div className="flex-1 p-4 space-y-6">
      <div className="flex justify-center my-4">
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: messageCount }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`flex max-w-[80%] gap-2 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
            >
              {i % 2 === 0 && (
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              )}
              <div>
                {i % 2 === 0 && <Skeleton className="mb-1 h-3 w-20" />}
                <Skeleton
                  className={`h-${12 + (i % 3) * 4} w-${48 + (i % 4) * 16} rounded-lg`}
                />
                <div
                  className={`mt-1 flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
