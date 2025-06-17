"use client";
import { MessageType } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reply, Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import {
  useReactToMessageMutation,
  useAppDispatch,
  useAppSelector,
} from "@/hooks";
import { setReplyMessage } from "@/lib/redux/slices/current-chat-slice";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface MessageActionsProps {
  message: MessageType;
  isOwn: boolean;
}

export function MessageActions({ message, isOwn }: MessageActionsProps) {
  const [showReactions, setShowReactions] = useState(false);
  const dispatch = useAppDispatch();
  const { mutate: onReact } = useReactToMessageMutation();
  const token = useAppSelector((state) => state.user.token);

  const onReply = (id: MessageType) => {
    dispatch(setReplyMessage(id));
  };
  return (
    <>
      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6 rounded-full shadow-xs"
                onClick={() => onReply(message)}
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
        <Popover open={showReactions} onOpenChange={setShowReactions}>
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
              <EmojiPicker
                theme={Theme.AUTO}
                reactionsDefaultOpen
                onEmojiClick={(emoji) => {
                  onReact({
                    chatId: message.chatId,
                    emoji: emoji.emoji,
                    messageId: message._id,
                    token: token!,
                  });
                  setShowReactions(false);
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
