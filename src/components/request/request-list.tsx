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
}

export function RequestsList({ requests }: RequestsListProps) {
  const [pendingRequests, setPendingRequests] =
    useState<FriendRequestType[]>(requests);
  const [isLoading, setIsLoading] = useState(false);
  const handleRequest = useCallback(
    async (
      senderId: string,
      action: FriendshipStatus,
      status: FriendshipStatus,
    ) => {
      try {
        setIsLoading(true);
        await handleFriendRequest(senderId, action);
        setPendingRequests((prev) =>
          prev.filter((req) => req.senderId !== senderId),
        );
        toast.success(actionMessages[action === status ? "PENDING" : action]);
      } catch (error) {
        console.error("Error processing request:", error);
        toast.error("Failed to process friend request");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friend Requests ({pendingRequests?.length || 0})</CardTitle>
        <CardDescription>Manage your incoming friend requests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingRequests.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No pending friend requests
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {pendingRequests.map((request) => (
                <RequestItem
                  key={request.id}
                  request={request}
                  isPending={isLoading}
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
