"use client";
import { MessageType, ParticipantsType } from "@/types";
import { useCallback, useRef, useState } from "react";
import {
  AttachmentPreviews,
  DateDivider,
  MessageActions,
  MessageContent,
  MessageContextMenu,
  MessageEditor,
  MessageTimestampStatus,
  ReactionsDisplay,
  ReplyPreview,
} from "@/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { cn } from "@/lib/utils";
import { messageVariants } from "@/animations/chat/messageVariants";

import {
  useTouchActions,
  useEditMessageMutation,
  useAppSelector,
} from "@/hooks";
import { motion } from "framer-motion";

interface MessageItemProps {
  participants: ParticipantsType[];
  message: MessageType;
  isOwn: boolean;
  showAvatar: boolean;
  replyMessage?: MessageType | null;
  showDate?: boolean;
  date?: string;
  currentUserId?: string;
}

export function MessageItem({
  participants,
  message,
  isOwn,
  showAvatar,
  replyMessage,
  showDate,
  date,
}: MessageItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const sender = participants.find(
    (user) => user.userId === message.sender.userId,
  );
  const { mutate: onEdit } = useEditMessageMutation();
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
  const token = useAppSelector((state) => state.user.token);

  const handleEdit = useCallback(() => {
    if (onEdit && editContent.trim() && editContent !== message.content) {
      onEdit({
        chatId: message.chatId,
        messageId: message._id,
        content: editContent,
        replyToId: message.replyToId,
        token: token!,
      });
      setEditMode(false);
    }
  }, [
    onEdit,
    editContent,
    message.content,
    message.chatId,
    message._id,
    message.replyToId,
    token,
  ]);

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
        onEdit={() => setEditMode(true)}
        onCopy={handleCopyToClipboard}
      >
        <motion.div
          data-message-id={message._id}
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

                    <MessageActions message={message} isOwn={isOwn} />
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
                  />
                )}
              </div>
              <MessageTimestampStatus message={message} isOwn={isOwn} />
            </div>
          </div>
        </motion.div>
      </MessageContextMenu>
    </>
  );
}
