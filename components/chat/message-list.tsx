"use client";

import { groupMessagesByDate } from "@/lib/utils/groupMessageByDate";
import { MessageType, ParticipantsType } from "@/types/ChatType";
import { User } from "next-auth";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DateDivider from "@/components/chat/date-divider";
import MessageItem from "@/components/chat/message-item";

interface MessageListProps {
  participants: ParticipantsType[];
  messages: MessageType[];
  currentUser: User;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onReplyMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onEditMessage?: (
    messageId: string,
    content: string,
    replyToId?: string,
  ) => void;
  onRetryMessage: (messageId: string) => Promise<void>;
}

export default function MessageList({
  participants,
  messages,
  currentUser,
  onDeleteMessage,
  onReplyMessage,
  onReactToMessage,
  onEditMessage,
  onRetryMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const messageMap = useMemo(() => {
    const map = new Map<string, MessageType>();
    messages.forEach((msg) => map.set(msg._id, msg));
    return map;
  }, [messages]);

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 h-full flex">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <Fragment key={date}>
          <DateDivider date={date} />
          {dateMessages.map((message, index) => {
            const replyMessage = message.replyToId
              ? messageMap.get(message.replyToId) || null
              : null;

            const previous = dateMessages[index - 1];
            const showAvatar = !previous || previous.sender !== message.sender;

            return (
              <MessageItem
                participants={participants}
                key={message._id}
                message={message}
                isOwn={message.sender.userId === currentUser?.id}
                showAvatar={showAvatar}
                onDelete={onDeleteMessage}
                onReply={onReplyMessage}
                onReact={onReactToMessage}
                onEdit={onEditMessage}
                onRetry={onRetryMessage}
                replyMessage={replyMessage}
                currentUserId={currentUser?.id}
              />
            );
          })}
        </Fragment>
      ))}
      <div ref={scrollRef} />
    </ScrollArea>
  );
}
