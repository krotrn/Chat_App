"use client";

import { groupMessagesByDate } from "@/lib/utils/groupMessageByDate";
import { Message } from "@/types/ChatType";
import { User } from "next-auth";
import { Fragment, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DateDivider from "@/components/chat/date-divider";
import MessageItem from "@/components/chat/message-item";

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
}: MessageListProps) {
  const messageMap = useMemo(() => {
    const map = new Map<string, Message>();
    messages.forEach((msg) => map.set(msg.id, msg));
    return map;
  }, [messages]);

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <Fragment key={date}>
          <DateDivider date={date} />
          {dateMessages.map((message, index) => {
            const replyMessage = message.replyToId
              ? messageMap.get(message.replyToId) || null
              : null;

            const previous = dateMessages[index - 1];
            const showAvatar = !previous || previous.senderId !== message.senderId;

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
