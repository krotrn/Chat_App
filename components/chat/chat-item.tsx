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

interface ChatItemProps {
  chat: ChatType;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (forEveryone: boolean) => void;
}

export default function ChatItem({
  chat,
  isSelected,
  onClick,
  onDelete,
}: ChatItemProps) {
  const { name, avatar, lastMessage } = chat;

  return (
    <motion.div
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md p-2",
        isSelected ? "bg-accent" : "hover:bg-muted"
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Avatar>
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium">{name}</p>
          {lastMessage && (
            <p className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lastMessage.createdAt), {
                addSuffix: true,
              })}
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
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
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
