"use client";
import { MessageType } from "@/types/ChatType";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reply, Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { reactionEmoji } from "@/lib/emojis";
import { useReactToMessageMutation } from "@/hooks/messages";
import { useAppDispatch, useAppSelector } from "@/hooks/types";
import { setReplyMessage } from "@/lib/redux/slices/current-chat-slice";

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
              {reactionEmoji.map((emoji) => (
                <button
                  key={emoji}
                  className="text-lg hover:scale-125 transition-transform p-1"
                  onClick={() => {
                    onReact({
                      chatId: message.chatId,
                      emoji,
                      messageId: message._id,
                      token: token!,
                    });
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
    </>
  );
}
