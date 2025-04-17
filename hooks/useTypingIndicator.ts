import { useState, useEffect, useRef, useCallback } from "react";
import {
  emitTyping,
  emitStopTyping,
  onTyping,
  onStopTyping,
} from "@/lib/socket";

type TypingCallback = (chatId: string) => void;

interface UseTypingIndicatorProps {
  chatId: string;
  currentUserId: string;
}

export default function useTypingIndicator({
  chatId,
  currentUserId,
}: UseTypingIndicatorProps) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastTypingEventRef = useRef<number>(0);
  const typingDelayRef = useRef<NodeJS.Timeout | null>(null);

  const clearTypingUser = useCallback((userId: string) => {
    setTypingUserIds((prevUserIds) =>
      prevUserIds.filter((id) => id !== userId),
    );
  }, []);

  const handleTypingEvent: TypingCallback = useCallback(
    (userChatId: string) => {
      const parts = userChatId.split(":");
      if (parts.length !== 2) return;

      const [userId, eventChatId] = parts;

      if (userId === currentUserId || eventChatId !== chatId) return;

      setTypingUserIds((prevUserIds) => {
        if (!prevUserIds.includes(userId)) {
          return [...prevUserIds, userId];
        }
        return prevUserIds;
      });

      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
      }

      typingTimeoutsRef.current[userId] = setTimeout(() => {
        clearTypingUser(userId);
      }, 3000);
    },
    [chatId, currentUserId, clearTypingUser],
  );

  const handleStopTypingEvent: TypingCallback = useCallback(
    (userChatId: string) => {
      const parts = userChatId.split(":");
      if (parts.length !== 2) return;

      const [userId, eventChatId] = parts;

      if (userId === currentUserId || eventChatId !== chatId) return;

      if (typingTimeoutsRef.current[userId]) {
        clearTimeout(typingTimeoutsRef.current[userId]);
        delete typingTimeoutsRef.current[userId];
      }

      clearTypingUser(userId);
    },
    [chatId, currentUserId, clearTypingUser],
  );

  const handleLocalUserTyping = useCallback(() => {
    const now = Date.now();

    if (now - lastTypingEventRef.current > 2000) {
      lastTypingEventRef.current = now;
      emitTyping(`${currentUserId}:${chatId}`);
    }

    if (typingDelayRef.current) {
      clearTimeout(typingDelayRef.current);
    }

    setIsTyping(true);

    typingDelayRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(`${currentUserId}:${chatId}`);
    }, 3000);
  }, [chatId, currentUserId]);

  useEffect(() => {
    const clearTypingListener = onTyping(handleTypingEvent);
    const clearStopTypingListener = onStopTyping(handleStopTypingEvent);

    const typingTimeouts = typingTimeoutsRef.current;

    return () => {
      clearTypingListener();
      clearStopTypingListener();

      Object.values(typingTimeouts).forEach(clearTimeout);

      if (typingDelayRef.current) {
        clearTimeout(typingDelayRef.current);
      }

      if (isTyping) {
        emitStopTyping(`${currentUserId}:${chatId}`);
      }
    };
  }, [
    chatId,
    currentUserId,
    handleTypingEvent,
    handleStopTypingEvent,
    isTyping,
  ]);

  return {
    typingUserIds,
    isTyping,
    handleLocalUserTyping,
  };
}
