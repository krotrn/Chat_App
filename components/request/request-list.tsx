"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { handleFriendRequest } from "@/lib/user-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RequestItem from "@/components/request/request-item";
import RequestSkeleton from "@/components/skeleton/request-skeleton";
import { FormattedFriendRequest } from "@/types/formattedDataTypes";

interface RequestsListProps {
  requests: FormattedFriendRequest[] | undefined;
  userId: string;
}

export function RequestsList({ requests, userId }: RequestsListProps) {
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [processedRequests, setProcessedRequests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRequest = useCallback(
    async (requestId: string, action: "accept" | "reject" | "block") => {
      setPendingRequests((prev) => [...prev, requestId]);
      try {
        await handleFriendRequest(requestId, userId, action);
        setProcessedRequests((prev) => [...prev, requestId]);
        const actionMessages: Record<string, string> = {
          accept: "Friend request accepted",
          reject: "Friend request rejected",
          block: "User blocked",
        };
        toast.success(actionMessages[action]);
      } catch (error) {
        console.error("Error processing request:", error);
        toast.error("Failed to process friend request");
      } finally {
        setPendingRequests((prev) => prev.filter((id) => id !== requestId));
      }
    },
    [userId]
  );

  const filteredRequests = requests?.filter(
    (request) => !processedRequests.includes(request.id)
  );

  return (
    <Card>
      <CardHeader>
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </>
        ) : (
          <>
            <CardTitle>Friend Requests ({filteredRequests?.length || 0})</CardTitle>
            <CardDescription>Manage your incoming friend requests.</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <RequestSkeleton key={i} />
            ))}
          </div>
        ) : filteredRequests && filteredRequests.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No pending friend requests
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests?.map((request) => (
                <RequestItem
                  key={request.id}
                  request={request}
                  isPending={pendingRequests.includes(request.id)}
                  onAction={handleRequest}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
