"use client";
import { MessageReaction } from "@/types/ChatType";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/useReduxType";

interface ReactionsDisplayProps {
  reactions: MessageReaction[];
  isOwn: boolean;
}

export function ReactionsDisplay({ reactions, isOwn }: ReactionsDisplayProps) {
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const groupedReactions = reactions.reduce<Record<string, string[]>>(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.userId);
      return acc;
    },
    {},
  );

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 mt-1 max-w-[80%]",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      {Object.entries(groupedReactions).map(([emoji, userIds]) => (
        <div
          key={emoji}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border border-border",
            currentUserId && userIds.includes(currentUserId)
              ? "bg-primary/20"
              : "bg-muted/50",
          )}
        >
          <span>{emoji}</span>
          <span className="opacity-70">{userIds.length}</span>
        </div>
      ))}
    </div>
  );
}
