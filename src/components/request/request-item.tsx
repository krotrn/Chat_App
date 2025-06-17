"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/components/ui";
import { CheckIcon, XIcon, BanIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FriendRequestType } from "@/types/formattedDataTypes";
import { FriendshipStatus } from "@prisma/client";

interface RequestItemProps {
  request: FriendRequestType;
  isPending: boolean;
  onAction: (
    requestId: string,
    action: FriendshipStatus,
    status: FriendshipStatus,
  ) => void;
}

export function RequestItem({
  request,
  isPending,
  onAction,
}: RequestItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4"
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage
            src={request.senderAvatar || ""}
            alt={request.senderName || request.senderUsername || "User"}
          />
          <AvatarFallback>
            {(request.senderName ||
              request.senderUsername ||
              "U")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{request.senderUsername}</p>
          <p className="text-xs text-muted-foreground">
            {request.requestCreatedAt
              ? formatDistanceToNow(request.requestCreatedAt, {
                  addSuffix: true,
                })
              : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 h-9 min-w-[80px]"
          disabled={isPending}
          onClick={() =>
            onAction(request.senderId, FriendshipStatus.FRIENDS, request.status)
          }
        >
          <CheckIcon className="mr-1 h-4 w-4" />
          <span>Accept</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-9 min-w-[80px]"
          disabled={isPending}
          onClick={() =>
            onAction(request.id, FriendshipStatus.REJECTED, request.status)
          }
        >
          <XIcon className="mr-1 h-4 w-4" />
          <span>Reject</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            onAction(request.id, FriendshipStatus.BLOCKED, request.status)
          }
          className="h-9 min-w-[80px]"
        >
          <BanIcon className="mr-1 h-4 w-4" />
          <span>Block</span>
        </Button>
      </div>
    </motion.div>
  );
}
