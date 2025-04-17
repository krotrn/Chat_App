"use client";
import { MessageType, StatusEnum } from "@/types/ChatType";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageTimestampStatusProps {
  message: MessageType;
  isOwn: boolean;
  onRetry?: (messageId: string) => void;
}

export function MessageTimestampStatus({
  message,
  isOwn,
  onRetry,
}: MessageTimestampStatusProps) {
  const hasReadReceipts = message.readBy && message.readBy.length > 0;
  const timestamp = message.updatedAt || message.createdAt;

  return (
    <div className="flex items-center gap-1 mt-1">
      <span
        className={cn(
          "text-xs text-muted-foreground",
          isOwn ? "text-right" : "",
        )}
      >
        {timestamp
          ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
          : "Just now"}
      </span>

      {/* Status indicators */}
      {message.status === StatusEnum.sending && (
        <span className="text-xs text-muted-foreground ml-1 flex items-center">
          Sending...
        </span>
      )}

      {message.status === StatusEnum.failed && (
        <span className="text-xs text-destructive ml-1 flex items-center gap-1">
          <AlertCircle size={12} />
          Failed
          {onRetry && (
            <button
              className="ml-1 flex items-center gap-1 text-xs underline hover:text-destructive/80"
              onClick={() => onRetry(message._id)}
            >
              <RefreshCw size={10} />
              Retry
            </button>
          )}
        </span>
      )}

      {isOwn && hasReadReceipts && (
        <div className="flex items-center ml-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center">
                  <Check size={12} className="text-green-500" />
                  {message.readBy && message.readBy.length > 1 && (
                    <span className="text-[10px] text-muted-foreground ml-0.5">
                      {message.readBy.length}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Read by {message.readBy?.length} user(s)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
