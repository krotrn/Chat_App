"use client";

import { MessageType, ParticipantsType } from "@/types/ChatType";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Pin } from "lucide-react";

interface PinnedMessageListProps {
  messages: MessageType[];
  pinnedMessageIds: string[];
  participants: ParticipantsType[];
  onMessageClick: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  currentUserId: string;
}

export function PinnedMessageList({
  messages,
  pinnedMessageIds,
  participants,
  onMessageClick,
  onUnpin,
  currentUserId,
}: PinnedMessageListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (messages && pinnedMessageIds) {
      const pinned = messages.filter((msg) =>
        pinnedMessageIds.includes(msg._id),
      );
      setPinnedMessages(pinned);
    }
  }, [messages, pinnedMessageIds]);

  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between p-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Pin className="h-3 w-3" />
          <span>
            {pinnedMessages.length} pinned{" "}
            {pinnedMessages.length === 1 ? "message" : "messages"}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-40 overflow-y-auto p-2 space-y-2">
              {pinnedMessages.map((message) => {
                const sender = participants.find(
                  (p) => p.userId === message.sender.userId,
                );
                const isOwn = message.sender.userId === currentUserId;

                return (
                  <div
                    key={message._id}
                    className={cn(
                      "flex items-start p-2 rounded-md text-xs gap-2 cursor-pointer",
                      isOwn ? "bg-primary/10" : "bg-muted/50",
                    )}
                    onClick={() => onMessageClick(message._id)}
                  >
                    <div className="flex-1 truncate">
                      <div className="font-medium">
                        {sender?.name || "Unknown"}
                      </div>
                      <p className="truncate">{message.content}</p>
                    </div>

                    {isOwn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnpin(message._id);
                        }}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
