"use client";

import { groupMessagesByDate } from "@/lib/utils/groupMessageByDate";
import { ParticipantsType } from "@/types/ChatType";
import { useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DateDivider from "@/components/chat/messages/date-divider";
import MessageItem from "@/components/chat/messages/message-item";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
import { useMessagesInfiniteQuery } from "@/hooks/queries/useMessagesInfiniteQuery";
import { useMarkAsReadMutation } from "@/hooks/queries/useMarkAsReadMutation";

interface MessageListProps {
  participants: ParticipantsType[];
}

export default function MessageList({ participants }: MessageListProps) {
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  const chatId = useAppSelector((state) => state.chat.currentChat?._id);
  const { mutate: markAsReadMutation } = useMarkAsReadMutation();
  const dispatch = useAppDispatch();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessagesInfiniteQuery(chatId!, 20);
  const bottom = useRef<HTMLDivElement>(null);
  const allMessages = useMemo(() => data?.pages ?? [], [data]);

  useEffect(() => {
    if (bottom.current) {
      bottom.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevScrollRef = useRef<number>(0);
  const topTrigger = useRef<HTMLDivElement>(null);
  const token = useAppSelector((state) => state.user.token);
  useEffect(() => {
    const ele = scrollAreaRef.current;
    if (!ele) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: ele, threshold: 0 }
    );
    if (topTrigger.current) observer.observe(topTrigger.current);
    return () => observer.disconnect();
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);
  const messages = useMemo(
    () => allMessages.flatMap((page) => page.messages) ?? [],
    [allMessages]
  );
  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages]
  );

  useEffect(() => {
    const ele = scrollAreaRef.current;
    if (!isFetchingNextPage && ele) {
      const diff = ele.scrollHeight - prevScrollRef.current;
      ele.scrollTop += diff;
      prevScrollRef.current = 0;
    }
  }, [allMessages.length, isFetchingNextPage]);

  useEffect(() => {
    const ele = scrollAreaRef.current;
    if (ele) ele.scrollTop = ele.scrollHeight;
  }, []);

  useEffect(() => {
    if (!chatId || !currentUserId) return;
    const messageIds = messages
      .filter(
        (msg) =>
          msg.sender.userId !== currentUserId &&
          !msg.readBy.some((r) => r.userId === currentUserId)
      )
      .map((msg) => msg._id);
    if (messageIds.length) {
      markAsReadMutation({ chatId, messageIds, token: token! });
    }
  }, [chatId, messages, currentUserId, dispatch, markAsReadMutation, token]);

  return (
    <ScrollArea
      className="flex-1 h-full flex flex-col overflow-y-auto"
      ref={scrollAreaRef}
    >
      <div ref={topTrigger} />
      <div className="flex flex-col-reverse gap-2 p-2">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <DateDivider date={date} />
            {dateMessages
              .slice()
              .reverse()
              .map((message, index) => {
                const replyMessage = message.replyToId
                  ? messages.find((m) => m._id === message.replyToId) || null
                  : null;

                const previous = dateMessages[index - 1];
                const showAvatar =
                  !previous || previous.sender.userId !== message.sender.userId;

                return (
                  <MessageItem
                    participants={participants}
                    key={message._id}
                    message={message}
                    isOwn={message.sender.userId === currentUserId}
                    showAvatar={showAvatar}
                    replyMessage={replyMessage}
                  />
                );
              })}
          </div>
        ))}
      </div>
      <div ref={bottom} />
    </ScrollArea>
  );
}
