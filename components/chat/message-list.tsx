"use client";

import { groupMessagesByDate } from "@/lib/utils/groupMessageByDate";
import { ParticipantsType } from "@/types/ChatType";
import { Fragment, useEffect, useMemo, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DateDivider from "@/components/chat/date-divider";
import MessageItem from "@/components/chat/message-item";
import { useChat } from "@/context/ChatProvider";
import { useChatActions } from "@/context/ChatActions";

export default function MessageList({
  participants,
}: {
  participants: ParticipantsType[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { handleMarkAsRead, messagesMap } = useChatActions();
  const { messages, currentUser } = useChat();
  const currentUserId = currentUser?.id;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedMessagesRef = useRef<Set<string>>(new Set());
  const pendingReadIdsRef = useRef<Set<string>>(new Set());

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  const debouncedMarkRead = useCallback(() => {
    const idsToMark = Array.from(pendingReadIdsRef.current);
    handleMarkAsRead(idsToMark);
    pendingReadIdsRef.current.clear();
  }, [handleMarkAsRead]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!currentUserId) return;

      entries.forEach((entry) => {
        const messageId = entry.target.getAttribute("data-message-id");
        if (!messageId) return;

        const message = messagesMap.current.get(messageId);
        if (
          !message ||
          message.sender.userId === currentUserId ||
          message.readBy.some((r) => r.userId === currentUserId)
        ) {
          if (observedMessagesRef.current.has(messageId)) {
            observerRef.current?.unobserve(entry.target);
            observedMessagesRef.current.delete(messageId);
          }
          return;
        }

        if (entry.isIntersecting) {
          pendingReadIdsRef.current.add(messageId);
          debouncedMarkRead();
          observerRef.current?.unobserve(entry.target);
          observedMessagesRef.current.delete(messageId);
        }
      });
    },
    [currentUserId, debouncedMarkRead, messagesMap],
  );

  useEffect(() => {
    const viewportElement =
      viewportRef.current?.querySelector<HTMLElement>(":scope > div");
    if (!viewportElement) {
      console.warn(
        "ScrollArea viewport element not found for IntersectionObserver.",
      );
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: viewportElement,
      threshold: 0.5,
    });

    const observer = observerRef.current;
    const observedMessages = observedMessagesRef.current;
    const pendingReadIds = pendingReadIdsRef.current;

    return () => {
      observer?.disconnect();
      observedMessages.clear();
      pendingReadIds.clear();
    };
  }, [handleIntersection, debouncedMarkRead]);

  useEffect(() => {
    const observer = observerRef.current;
    const viewportElement =
      viewportRef.current?.querySelector<HTMLElement>(":scope > div");
    if (!observer || !viewportElement || !currentUserId) return;

    const currentObserved = observedMessagesRef.current;
    const newlyObserved = new Set<string>();

    const messageElements =
      viewportElement.querySelectorAll<HTMLElement>("[data-message-id]");

    messageElements.forEach((element) => {
      const messageId = element.getAttribute("data-message-id");
      if (!messageId) return;

      const message = messagesMap.current.get(messageId);
      if (
        !message ||
        message.sender.userId === currentUserId ||
        message.readBy.some((r) => r.userId === currentUserId)
      ) {
        if (currentObserved.has(messageId)) {
          observer.unobserve(element);
          currentObserved.delete(messageId);
        }
        return;
      }

      if (!currentObserved.has(messageId)) {
        observer.observe(element);
        newlyObserved.add(messageId);
      } else {
        newlyObserved.add(messageId);
      }
    });

    currentObserved.forEach((observedId) => {
      if (!newlyObserved.has(observedId)) {
        const elementToUnobserve = viewportElement.querySelector<HTMLElement>(
          `[data-message-id="${observedId}"]`,
        );
        if (elementToUnobserve) {
          observer.unobserve(elementToUnobserve);
        }
      }
    });

    observedMessagesRef.current = newlyObserved;
  }, [messages, messagesMap, currentUserId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 h-full flex" ref={viewportRef}>
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <Fragment key={date}>
          <DateDivider date={date} />
          {dateMessages.map((message, index) => {
            const replyMessage = message.replyToId
              ? messagesMap.current.get(message.replyToId) || null
              : null;

            const previous = dateMessages[index - 1];
            const showAvatar =
              !previous || previous.sender.userId !== message.sender.userId;

            return (
              <MessageItem
                participants={participants}
                key={message._id}
                message={message}
                isOwn={message.sender.userId === currentUser?.id}
                showAvatar={showAvatar}
                replyMessage={replyMessage}
              />
            );
          })}
        </Fragment>
      ))}
      <div ref={bottomRef} />
    </ScrollArea>
  );
}
