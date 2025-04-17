"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ParticipantsType } from "@/types/ChatType";

interface TypingIndicatorProps {
  isTyping: boolean;
  typingUserIds: string[];
  participants: ParticipantsType[];
}

export default function TypingIndicator({
  isTyping,
  typingUserIds,
  participants,
}: TypingIndicatorProps) {
  if (!isTyping || typingUserIds.length === 0) {
    return null;
  }

  const typingUsers = participants.filter((participant) =>
    typingUserIds.includes(participant.userId),
  );

  if (typingUsers.length === 0) {
    return null;
  }

  const typingMessage = (() => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn("px-4 py-2 text-xs text-muted-foreground")}
    >
      <div className="flex items-center">
        <span className="mr-2">{typingMessage}</span>
        <div className="flex space-x-1">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: 0,
            }}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: 0.2,
            }}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
              delay: 0.4,
            }}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          />
        </div>
      </div>
    </motion.div>
  );
}
