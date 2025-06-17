"use client";
import { MessageType, StatusEnum } from "@/types";
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
} from "@/components/ui";
import {
  Copy,
  Pencil,
  Reply,
  Smile,
  Trash2,
  RefreshCw,
  Pin,
} from "lucide-react";
import {
  useDeleteMessageMutation,
  useAppDispatch,
  useAppSelector,
  useReactToMessageMutation,
} from "@/hooks";
import { setReplyMessage } from "@/lib/redux/slices/current-chat-slice";
import EmojiPicker, { SkinTones, Theme } from "emoji-picker-react";

interface MessageContextMenuProps {
  message: MessageType;
  isOwn: boolean;
  children: ReactNode;
  onCopy: () => void;
  onEdit?: () => void;
  onRetry?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
  isPinned?: boolean;
}

export function MessageContextMenu({
  message,
  isOwn,
  children,
  onCopy,
  onEdit,
  onRetry,
  onPin,
  onUnpin,
  isPinned,
}: MessageContextMenuProps) {
  const { mutate: onDelete } = useDeleteMessageMutation();
  const { mutate: onReact } = useReactToMessageMutation();
  const dispatch = useAppDispatch();
  const onReply = (message: MessageType) => {
    dispatch(setReplyMessage(message));
  };
  const token = useAppSelector((state) => state.user.token);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {message.status === StatusEnum.FAILED && onRetry ? (
          <ContextMenuItem onClick={() => onRetry(message._id)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry sending
          </ContextMenuItem>
        ) : (
          <>
            <ContextMenuItem onClick={() => onReply(message)}>
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
                    <EmojiPicker
                      reactionsDefaultOpen
                      searchDisabled
                      theme={Theme.AUTO}
                      defaultSkinTone={SkinTones.NEUTRAL}
                      onEmojiClick={(emoji) => {
                        onReact({
                          chatId: message.chatId,
                          emoji: emoji.emoji,
                          messageId: message._id,
                          token: token!,
                        });
                      }}
                    />
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
              onClick={() =>
                onDelete({
                  message: message,
                  forEveryone: false,
                  token: token!,
                })
              }
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete for me
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                onDelete({
                  message: message,
                  forEveryone: true,
                  token: token!,
                })
              }
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete for Everyone
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
