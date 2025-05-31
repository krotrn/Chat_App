"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AIModel } from "@/types/ChatType";
import { cn } from "@/lib/utils";
// import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
// import { setCurrentChat } from "@/lib/redux/slices/chat-slice";

interface AIChatItemProps {
  model: AIModel;
}

export default function AIChatItem({ model }: AIChatItemProps) {
  // const { currentChat } = useAppSelector((state) => state.chat);
  // const dispatch = useAppDispatch();
  // const isSelected = currentChat?._id === model.id;
  const onClick = () => {};
  return (
    <motion.div
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md p-2 bg-primary/5",
        // isSelected ? "bg-accent" : "hover:bg-muted",
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Avatar className="bg-primary/10">
        <AvatarImage src={model.avatar} alt={model.name} />
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="truncate font-medium flex items-center gap-1">
            <Bot className="h-3 w-3 text-primary" />
            {model.name}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-muted-foreground">
            Ask me anything...
          </p>
        </div>
      </div>
    </motion.div>
  );
}
