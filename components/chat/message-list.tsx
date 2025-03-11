"use client"
import { groupMessagesByDate } from "@/lib/utils/groupMessageByDate";
import { Message } from "@/types/ChatType";
import { User } from "next-auth";
import { Fragment, useEffect, useState } from "react";
import MessageListSkeleton from "../skeleton/message-list-skeleton";
import { ScrollArea } from "../ui/scroll-area";
import DateDivider from "./date-divider";
import MessageItem from "./message-item";

interface MessageListProps {
  messages: Message[]
  currentUser: User
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void
  onReplyMessage: (messageId: string) => void
  onReactToMessage: (messageId: string, emoji: string) => void
  isLoading?: boolean
}

export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
  onReplyMessage,
  onReactToMessage,
  isLoading = false,
}: MessageListProps) {
  const [isInitalLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(true);
    }, 1200);
    return () => clearTimeout(timer);
  })

  const loading = isLoading || isInitalLoading;
  const groupMessages = groupMessagesByDate(messages);

  const findMessageById = (messageId: string): Message | undefined => {
    return messages.find((msg) => msg.id === messageId)
  }
  if (loading) {
    return <MessageListSkeleton />
  }

  return (
    <ScrollArea className="flex-1 p-4">
      {Object.entries(groupMessages).map(([date, dateMessages]) => (
        <Fragment key={date}>
          <DateDivider date={date} />
          {dateMessages.map((message, index) => {
            const replyMessage = message.replyToId ? findMessageById(message.replyToId) : null
            const showAvatar = index === 0 || dateMessages[index - 1]?.senderId !== message.senderId

            return (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser.id}
                showAvatar={showAvatar}
                onDelete={onDeleteMessage}
                onReply={onReplyMessage}
                onReact={onReactToMessage}
                replyMessage={replyMessage || undefined}
              />
            )
          })}
        </Fragment>
      ))}
    </ScrollArea>
  )
}
