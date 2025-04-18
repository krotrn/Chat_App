"use client";
import { MessageType, ParticipantsType } from "@/types/ChatType";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { messageVariants } from "@/animations/chat/messageVariants";
import DateDivider from "@/components/chat/date-divider";
import { MessageContextMenu } from "@/components/chat/message/context-menu";
import { MessageContent } from "@/components/chat/message/content";
import { MessageActions } from "./message/actions";
import { MessageEditor } from "@/components/chat/message/editor";
import { ReplyPreview } from "@/components/chat/reply-preview";
import { ReactionsDisplay } from "@/components/chat/reaction-display";
import { MessageTimestampStatus } from "@/components/chat/message-timestamp-status";
import useTouchActions from "@/hooks/useTouchActions";
import { motion } from "framer-motion";
import { AttachmentPreviews } from "./attachment-previews";

interface MessageItemProps {
  participants: ParticipantsType[];
  message: MessageType;
  isOwn: boolean;
  showAvatar: boolean;
  onDelete: (messageId: string, forEveryone: boolean) => void;
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, content: string, replyToId?:string) => void;
  onRetry?: (messageId: string) => void;
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
  onRetry,
  replyMessage,
  showDate,
  date,
  currentUserId,
}: MessageItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const sender = participants.find(
    (user) => user.userId === message.sender.userId,
  );
  const replySender = replyMessage
    ? participants.find((user) => user.userId === replyMessage.sender.userId)
    : null;
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  const { handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd } =
    useTouchActions(
      handleCopyToClipboard,
      longPressTimeoutRef,
      setIsLongPressed,
    );

  const handleEdit = () => {
    if (onEdit && editContent.trim() && editContent !== message.content) {
      console.log(message._id, editContent);
      onEdit(message._id, editContent, message.replyToId);
      setEditMode(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditContent(message.content);
  };

  return (
    <>
      {showDate && date && <DateDivider date={date} />}
      <MessageContextMenu
        message={message}
        isOwn={isOwn}
        onDelete={onDelete}
        onReply={onReply}
        onEdit={() => setEditMode(true)}
        onCopy={handleCopyToClipboard}
        onReact={onReact}
      >
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
              isOwn ? "flex-row-reverse" : "flex-row",
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
                className={cn("space-y-2", isOwn ? "items-end" : "items-start")}
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
                      isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {editMode ? (
                      <MessageEditor
                        editContent={editContent}
                        setEditContent={setEditContent}
                        onSave={handleEdit}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <MessageContent message={message} isOwn={isOwn} />
                    )}

                    <MessageActions
                      message={message}
                      isOwn={isOwn}
                      onReact={onReact}
                      onReply={onReply}
                    />
                  </div>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div className={cn("max-w-sm", isOwn && "ml-auto")}>
                    <AttachmentPreviews
                      attachments={message.attachments}
                      isOwn={isOwn}
                    />
                  </div>
                )}

                {message.reactions && message.reactions.length > 0 && (
                  <ReactionsDisplay
                    reactions={message.reactions}
                    isOwn={isOwn}
                    currentUserId={currentUserId}
                  />
                )}
              </div>
              <MessageTimestampStatus
                message={message}
                isOwn={isOwn}
                onRetry={onRetry}
              />
            </div>
          </div>
        </motion.div>
      </MessageContextMenu>
    </>
  );
}
