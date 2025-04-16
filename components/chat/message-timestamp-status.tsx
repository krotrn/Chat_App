import { cn } from "@/lib/utils";
import { StatusEnum } from "@/types/ChatType";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
export function MessageTimestampStatus({
  timestamp,
  isOwn,
  status,
}: {
  timestamp: string;
  isOwn: boolean;
  status: StatusEnum;
}) {
  return (
    <div
      className={cn(
        "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <span>{format(new Date(timestamp), "HH:mm")}</span>
      {isOwn &&
        (status === "read" ? (
          <CheckCheck className="h-3 w-3" />
        ) : (
          <Check className="h-3 w-3" />
        ))}
    </div>
  );
}
