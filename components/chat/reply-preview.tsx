import { cn } from "@/lib/utils";
import { MessageType, ParticipantsType } from "@/types/ChatType";

export function ReplyPreview({
  replyMessage,
  replySender,
  isOwn,
}: {
  replyMessage: MessageType;
  replySender?: ParticipantsType | null;
  isOwn: boolean;
}) {
  if (!replyMessage) return null;

  return (
    <div
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs border-l-2 mb-1",
        isOwn
          ? "bg-primary/10 border-primary text-primary-foreground"
          : "bg-muted/70 border-muted-foreground text-foreground",
      )}
    >
      <p className="font-medium text-xs">
        {!replySender
          ? "Replying to message"
          : replySender.userId === replyMessage.sender.userId
            ? "Replying to themselves"
            : `Replying to ${replySender?.name}`}
      </p>
      <p className="truncate opacity-80 mt-0.5">
        {replyMessage.content || "Attachment"}
      </p>
    </div>
  );
}
