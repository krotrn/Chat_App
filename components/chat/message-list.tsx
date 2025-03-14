"use client";
import { groupMessagesByDate } from "@/lib/utils/groupMessageByDate";
import { Message } from "@/types/ChatType";
import { User } from "next-auth";
import { Fragment, useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import DateDivider from "./date-divider";
import MessageItem from "./message-item";
import MessageListSkeleton from "../skeleton/message-list-skeleton";

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onReplyMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  isLoading?: boolean;
}

export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
  onReplyMessage,
  onReactToMessage,
  isLoading = false,
}: MessageListProps) {
  const [groupedMessages, setGroupedMessages] = useState<
    Record<string, Message[]>
  >({});
  useEffect(() => {
    const grouped = groupMessagesByDate(messages);
    setGroupedMessages(grouped);
  }, [messages]);
  if (isLoading) return <MessageListSkeleton />;

  const findMessageById = (messageId: string): Message | undefined =>
    messages.find((msg) => msg.id === messageId);

  return (
    <ScrollArea className="flex-1 p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <Fragment key={date}>
          <DateDivider date={date} />
          {dateMessages.map((message, index) => {
            const replyMessage = message.replyToId
              ? findMessageById(message.replyToId)
              : null;
            const showAvatar =
              index === 0 ||
              dateMessages[index - 1]?.senderId !== message.senderId;
            return (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser?.id}
                showAvatar={showAvatar}
                onDelete={onDeleteMessage}
                onReply={onReplyMessage}
                onReact={onReactToMessage}
                replyMessage={replyMessage}
              />
            );
          })}
        </Fragment>
      ))}
    </ScrollArea>
  );
}
