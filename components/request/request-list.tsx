"use client";
import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RequestItem from "@/components/request/request-item";
import { FriendRequestType } from "@/types/formattedDataTypes";
import { handleFriendRequest } from "@/actions/userUtils";
import { FriendshipStatus } from "@prisma/client";
import { actionMessages } from "@/lib/helper";
interface RequestsListProps {
  requests: FriendRequestType[];
  userId: string;
  pending: string[];
}

export function RequestsList({ requests, userId, pending }: RequestsListProps) {
  const [pendingRequests, setPendingRequests] = useState<string[]>(pending);
  const [processedRequests, setProcessedRequests] = useState<string[]>([]);
  const handleRequest = useCallback(
    async (
      requestId: string,
      action: FriendshipStatus,
      status: FriendshipStatus,
    ) => {
      setPendingRequests((prev) => [...prev, requestId]);
      try {
        await handleFriendRequest(requestId, userId, action);
        setProcessedRequests((prev) => [...prev, requestId]);
        toast.success(actionMessages[action === status ? "PENDING" : action]);
      } catch (error) {
        console.error("Error processing request:", error);
        toast.error("Failed to process friend request");
      } finally {
        setPendingRequests((prev) => prev.filter((id) => id !== requestId));
      }
    },
    [userId],
  );

  const filteredRequests = requests.filter(
    (request) => !processedRequests.includes(request.id),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests ({filteredRequests?.length || 0})</CardTitle>
        <CardDescription>Manage your incoming friend requests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No pending friend requests
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests.map((request) => (
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
