import { cn } from "@/lib/utils";
import { MessageReaction } from "@/types/ChatType";

export function ReactionsDisplay({ reactions, isOwn }: {
  reactions: MessageReaction[],
  isOwn: boolean
}) {
  const groupedReactions: Record<string, MessageReaction[]> = {};
  reactions?.forEach((reaction) => {
    groupedReactions[reaction.emoji] = groupedReactions[reaction.emoji] || [];
    groupedReactions[reaction.emoji].push(reaction);
  });

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {Object.entries(groupedReactions).map(([emoji, group]) => (
        <div
          key={emoji}
          className="flex items-center bg-background rounded-full border px-2 py-0.5 text-xs shadow-xs"
        >
          <span className="mr-1">{emoji}</span>
          <span className="text-muted-foreground">{group.length}</span>
        </div>
      ))}
    </div>
  );
}