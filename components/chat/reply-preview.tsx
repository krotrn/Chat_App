import { cn } from "@/lib/utils";
import { MessageType, ParticipantsType } from "@/types/ChatType";

export function ReplyPreview({ replyMessage, replySender, isOwn }: {
  replyMessage: MessageType,
  replySender?: ParticipantsType | null,
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
        {replySender?.userId === replyMessage.sender
          ? "Replying to themselves"
          : `Replying to ${replySender?.name}`}
      </p>
      <p className="truncate opacity-80">{replyMessage.content}</p>
    </div>
  );
}