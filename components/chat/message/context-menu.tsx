"use client";
import { MessageType, StatusEnum } from "@/types/ChatType";
import { ReactNode } from "react";
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
import {
  Copy,
  Pencil,
  Reply,
  Smile,
  Trash2,
  RefreshCw,
  Pin,
} from "lucide-react";
import { reactionEmoji } from "@/lib/emojis";

interface MessageContextMenuProps {
  message: MessageType;
  isOwn: boolean;
  children: ReactNode;
  onDelete: (messageId: string, forEveryone: boolean) => void;
  onReply: (messageId: string) => void;
  onCopy: () => void;
  onEdit?: () => void;
  onReact: (messageId: string, emoji: string) => void;
  onRetry?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
  isPinned?: boolean;
}

export function MessageContextMenu({
  message,
  isOwn,
  children,
  onDelete,
  onReply,
  onCopy,
  onEdit,
  onReact,
  onRetry,
  onPin,
  onUnpin,
  isPinned,
}: MessageContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {message.status === StatusEnum.failed && onRetry ? (
          <ContextMenuItem onClick={() => onRetry(message._id)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry sending
          </ContextMenuItem>
        ) : (
          <>
            <ContextMenuItem onClick={() => onReply(message._id)}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </ContextMenuItem>
            <ContextMenuItem onClick={onCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </ContextMenuItem>
            {isPinned !== undefined && (
              <ContextMenuItem
                onClick={() =>
                  isPinned
                    ? onUnpin && onUnpin(message._id)
                    : onPin && onPin(message._id)
                }
              >
                <Pin className="mr-2 h-4 w-4" />
                {isPinned ? "Unpin Message" : "Pin Message"}
              </ContextMenuItem>
            )}
            {isOwn && onEdit && (
              <ContextMenuItem onClick={onEdit}>
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
          </>
        )}
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
  );
}
