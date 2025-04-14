"use client";
import useTouchActions from "@/hooks/useTouchActions";
import { MessageType, ParticipantsType } from "@/types/ChatType";
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
import { Copy, Pencil, Reply, Smile, Trash2, Check } from "lucide-react";
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
  participants: ParticipantsType[];
  message: MessageType;
  isOwn: boolean;
  showAvatar: boolean;
  onDelete: (messageId: string, forEveryone: boolean) => void;
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  replyMessage?: MessageType | null;
  showDate?: boolean;
  date?: string;
  currentUserId?: string;
}

export default function MessageItem({
  participants,
  message,
  isOwn,
  showAvatar,
  onDelete,
  onReply,
  onReact,
  onEdit,
  replyMessage,
  showDate,
  date,
}: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const sender = participants.find((user) => user.userId === message.sender.userId);
  const replySender = replyMessage
    ? participants.find((user) => user.userId === replyMessage.sender.userId)
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
    
  const handleEdit = () => {
    if (onEdit && editContent.trim() && editContent !== message.content) {
      onEdit(message._id, editContent);
      setEditMode(false);
    }
  };

  const hasReadReceipts = message.readBy && message.readBy.length > 0;

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
                      {editMode ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[60px] text-sm p-2 rounded bg-background border"
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
                              onClick={() => setEditMode(false)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80"
                              onClick={handleEdit}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{message.content}</p>
                          {message.edited?.isEdited && (
                            <span className="text-[10px] opacity-70 ml-1">(edited)</span>
                          )}
                        </>
                      )}
                      
                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-6 w-6 rounded-full shadow-xs"
                                onClick={() => onReply(message._id)}
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
                                    onReact(message._id, emoji);
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
                  <div className="flex items-center gap-1">
                    <MessageTimestampStatus
                      isOwn={isOwn}
                      status={"sent"}
                      timestamp={message.updatedAt.toLocaleString()}
                    />
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
                </div>
              </div>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onReply(message._id)}>
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </ContextMenuItem>
          {isOwn && onEdit && (
            <ContextMenuItem onClick={() => setEditMode(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Smile className="mr-2 h-4 w-4" />
              React
            </ContextMenuSubTrigger>
            <ContextMenuPortal>
              <ContextMenuSubContent className="p-2">
                <div className="flex flex-wrap gap-2 max-w-48">
                  {reactionEmoji.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-lg hover:scale-125 transition-transform p-1"
                      onClick={() => onReact(message._id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ContextMenuSubContent>
            </ContextMenuPortal>
          </ContextMenuSub>
          {isOwn && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onDelete(message._id, true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
