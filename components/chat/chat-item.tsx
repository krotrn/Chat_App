"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat } from "@/types/ChatType";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  const { name, avatar, lastMessage, unreadCount } = chat;

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
            <p className="text-xs text-muted-foreground">
              {format(new Date(lastMessage.timestamp), "HH:mm")}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          {lastMessage && (
            <p className="truncate text-sm text-muted-foreground">
              {lastMessage.content}
            </p>
          )}
          {unreadCount > 0 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}