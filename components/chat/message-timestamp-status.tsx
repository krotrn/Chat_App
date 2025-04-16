import { cn } from "@/lib/utils";
import { StatusEnum } from "@/types/ChatType";
import { format, isValid } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

export function MessageTimestampStatus({
  timestamp,
  isOwn,
  status,
}: {
  timestamp: string | Date | null | undefined;
  isOwn: boolean;
  status: StatusEnum;
}) {
  // Format the timestamp safely
  const formatTimestamp = () => {
    if (!timestamp) return "--:--";
    
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return isValid(date) ? format(date, "HH:mm") : "--:--";
    } catch (error) {
      console.error("Error formatting timestamp:", error, { timestamp });
      return "--:--";
    }
  };

  return (
    <div
      className={cn(
        "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
        isOwn ? "justify-end" : "justify-start",
      )}
    >
      <span>{formatTimestamp()}</span>
      {isOwn &&
        (status === "read" ? (
          <CheckCheck className="h-3 w-3" />
        ) : (
          <Check className="h-3 w-3" />
        ))}
    </div>
  );
}
