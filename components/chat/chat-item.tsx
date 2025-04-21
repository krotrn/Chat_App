"use client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatType } from "@/types/ChatType";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useChat } from "@/context/ChatProvider";

interface ChatItemProps {
  chat: ChatType;
}

export default function ChatItem({ chat }: ChatItemProps) {
  const { name, avatarUrl, lastMessage } = chat;
  const { currentUser, currentChatId, handleDeleteChat, setCurrentChatId } =
    useChat();
  const isSelected = currentChatId === chat._id;

  const onClick = () => {
    setCurrentChatId(chat._id);
  };

  const onDelete = (forEveryone: boolean) => {
    handleDeleteChat(chat._id, forEveryone)
      .then(() => {
        if (isSelected) {
          setCurrentChatId(null);
        }
      })
      .catch((error) => {
        console.error("Error deleting chat:", error);
      });
  };

  let title: string;
  let avatar: string | undefined;
  if (chat.type === "direct") {
    [title, avatar] = [
      chat.participants.filter((p) => p.userId !== currentUser.id)[0].name,
      chat.participants.filter((p) => p.userId !== currentUser.id)[0].avatarUrl,
    ];
  } else {
    title = name;
    avatar = avatarUrl;
  }

  return (
    <motion.div
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md p-2",
        isSelected ? "bg-accent" : "hover:bg-muted",
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Avatar>
        <AvatarImage src={avatar} alt={title} />
        <AvatarFallback>{title.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium">{title}</p>
          {lastMessage && (
            <p className="shrink-0 text-xs text-muted-foreground">
              {lastMessage.createdAt
                ? formatDistanceToNow(new Date(lastMessage.createdAt), {
                    addSuffix: true,
                  })
                : "Unknown time"}
            </p>
          )}
        </div>
        {lastMessage && (
          <p className="truncate text-xs text-muted-foreground">
            {lastMessage.content}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(false);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete for me
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete for everyone
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
