import { format, isToday, isYesterday, isSameDay } from "date-fns";
import type { MessageType } from "@/types";

export function formatMessageDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
}

export function groupMessagesByDate(
  messages: MessageType[],
): Record<string, MessageType[]> {
  const grouped: Record<string, MessageType[]> = {};
  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const dateKey = formatMessageDate(date);

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(message);
  });

  return grouped;
}

export function formatMessageTime(timestamp: string): string {
  return format(new Date(timestamp), "h:mm a");
}

export function isSameDate(date1: string, date2: string): boolean {
  return isSameDay(new Date(date1), new Date(date2));
}
