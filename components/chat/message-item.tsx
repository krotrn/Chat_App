"use client";
import useTouchActions from "@/hooks/useTouchActions";
import { mockUsers } from "@/lib/mock-data";
import { Message } from "@/types/ChatType";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { messageVariants } from "@/animations/chat/messageVariants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Reply, Smile, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AttachmentPreview from "@/components/chat/attachment-previews";
import { reactionEmoji } from "@/lib/emojis";
import DateDivider from "@/components/chat/date-divider";
import { ReplyPreview } from "@/components/chat/reply-preview";
import { ReactionsDisplay } from "@/components/chat/reaction-display";
import { MessageTimestampStatus } from "@/components/chat/message-timestamp-status";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onDelete: (messageId: string, forEveryone: boolean) => void;
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  replyMessage?: Message | null;
  showDate?: boolean;
  date?: string;
}

export default function MessageItem({
  message,
  isOwn,
  showAvatar,
  onDelete,
  onReply,
  onReact,
  replyMessage,
  showDate,
  date,
}: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false);
  const sender = mockUsers.find((user) => user.id === message.senderId);
  const replySender = replyMessage
    ? mockUsers.find((user) => user.id === replyMessage.senderId)
    : null;
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };

  const { handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd } =
    useTouchActions(
      handleCopyToClipboard,
      longPressTimeoutRef,
      setIsLongPressed
    );

  return (
    <>
      {showDate && date && <DateDivider date={date} />}
      <ContextMenu>
        <ContextMenuTrigger>
          <motion.div
            className={cn("mb-4 flex", isOwn ? "justify-end" : "justify-start")}
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: isLongPressed ? "scale(0.98)" : "scale(1)",
              transition: "transform 0.2s",
            }}
          >
            <div
              className={cn(
                "flex max-w-[80%] gap-2",
                isOwn ? "flex-row-reverse" : "flex-row"
              )}
            >
              {showAvatar && !isOwn ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={sender?.avatarUrl || ""}
                    alt={sender?.name || ""}
                  />
                  <AvatarFallback>
                    {sender?.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8" />
              )}
              <div>
                {showAvatar && !isOwn && sender && (
                  <p className="mb-1 text-xs font-medium">{sender.name}</p>
                )}
                <div
                  className={cn(
                    "space-y-2",
                    isOwn ? "items-end" : "items-start"
                  )}
                >
                  {replyMessage && (
                    <ReplyPreview
                      replyMessage={replyMessage}
                      replySender={replySender}
                      isOwn={isOwn}
                    />
                  )}
                  {message.content && (
                    <div
                      className={cn(
                        "relative rounded-lg px-3 py-2 group",
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-6 w-6 rounded-full shadow-xs"
                                onClick={() => onReply(message.id)}
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reply</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="absolute -left-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Popover
                          open={showReactions}
                          onOpenChange={setShowReactions}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6 rounded-full shadow-xs"
                            >
                              <Smile className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-2"
                            align={isOwn ? "end" : "start"}
                          >
                            <div className="flex gap-1">
                              {reactionEmoji.map((emoji) => (
                                <button
                                  key={emoji}
                                  className="text-lg hover:scale-125 transition-transform p-1"
                                  onClick={() => {
                                    onReact(message.id, emoji);
                                    setShowReactions(false);
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                  {message.attachments && message.attachments.length > 0 && (
                    <div
                      className={cn(
                        "grid gap-2",
                        message.content ? "mt-2" : ""
                      )}
                    >
                      {message.attachments.map((attachment, index) => (
                        <AttachmentPreview
                          key={index}
                          file={attachment}
                          className={cn(
                            isOwn ? "bg-primary/10" : "bg-muted/50",
                            "max-w-sm"
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {message.reactions && message.reactions.length > 0 && (
                    <ReactionsDisplay
                      isOwn={isOwn}
                      reactions={message.reactions}
                    />
                  )}
                  <MessageTimestampStatus
                    isOwn={isOwn}
                    status={message.status}
                    timestamp={message.updatedAt}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onReply(message.id)}>
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy text
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Smile className="mr-2 h-4 w-4" />
              React with emoji
            </ContextMenuSubTrigger>
            <ContextMenuPortal>
              <ContextMenuSubContent className="p-2">
                <div className="grid grid-cols-4 gap-2">
                  {reactionEmoji.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-lg hover:bg-accent rounded-md p-1 transition-colors"
                      onClick={() => onReact(message.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
          <ContextMenuSeparator />
          {isOwn ? (
            <>
              <ContextMenuItem onClick={() => onDelete(message.id, false)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete for me
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onDelete(message.id, true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete for everyone
              </ContextMenuItem>
            </>
          ) : (
            <ContextMenuItem onClick={() => onDelete(message.id, false)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete for me
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
