import { cn } from "@/lib/utils";
import { MessageType, ParticipantsType } from "@/types/ChatType";

export function ReplyPreview({
  replyMessage,
  replySender,
}: {
  replyMessage: MessageType;
  replySender?: ParticipantsType | null;
}) {
  if (!replyMessage) return null;

  return (
    <div
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs border-l-2 mb-1",
      )}
    >
      <p className="font-medium text-xs">
        {!replySender
          ? "Replying to message"
          : replySender.userId === replyMessage.sender.userId
            ? "Replying to own"
            : `Replying to ${replySender?.name}`}
      </p>
      <p className="truncate opacity-80 mt-0.5">
        {replyMessage.content || "Attachment"}
      </p>
    </div>
  );
}
