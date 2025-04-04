import { cn } from "@/lib/utils";
import { Message } from "@/types/ChatType";
import { User } from "next-auth";

export function ReplyPreview({ replyMessage, replySender, isOwn }: {
  replyMessage: Message,
  replySender?: User | null,
  isOwn: boolean
}) {
  if (!replyMessage) return null;

  return (
    <div
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs border-l-2",
        isOwn ? "bg-primary/10 border-primary/30" : "bg-muted/70 border-muted-foreground/30"
      )}
    >
      <p className="font-medium text-xs">
        {replySender?.id === replyMessage.senderId
          ? "Replying to themselves"
          : `Replying to ${replySender?.name}`}
      </p>
      <p className="truncate opacity-80">{replyMessage.content}</p>
    </div>
  );
}