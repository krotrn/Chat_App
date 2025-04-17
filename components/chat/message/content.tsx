"use client";
import { MessageType } from "@/types/ChatType";

interface MessageContentProps {
  message: MessageType;
  isOwn: boolean;
}

export function MessageContent({ message }: MessageContentProps) {
  return (
    <>
      <p className="text-sm">{message.content}</p>
      {message.edited?.isEdited && (
        <span className="text-[10px] opacity-70 ml-1">(edited)</span>
      )}
    </>
  );
}
