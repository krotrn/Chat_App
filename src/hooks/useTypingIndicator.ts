import { useState, useEffect, useRef, useCallback } from "react";
import {
  emitTyping,
  emitStopTyping,
  onTyping,
  onStopTyping,
} from "@/lib/socket";

type TypingCallback = (data: { userId: string; chatId: string }) => void;

interface UseTypingIndicatorProps {
  chatId: string | null;
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
      prevUserIds.filter((id) => id !== userId)
    );
  }, []);

  const handleTypingEvent: TypingCallback = useCallback(
    (data: { userId: string; chatId: string }) => {
      if (data.userId === currentUserId || data.chatId !== chatId) return;

      setTypingUserIds((prevUserIds) => {
        if (!prevUserIds.includes(data.userId)) {
          return [...prevUserIds, data.userId];
        }
        return prevUserIds;
      });

      if (typingTimeoutsRef.current[data.userId]) {
        clearTimeout(typingTimeoutsRef.current[data.userId]);
      }

      typingTimeoutsRef.current[data.userId] = setTimeout(() => {
        clearTypingUser(data.userId);
      }, 3000);
    },
    [chatId, currentUserId, clearTypingUser]
  );

  const handleStopTypingEvent: TypingCallback = useCallback(
    (data: { userId: string; chatId: string }) => {
      if (data.userId === currentUserId || data.chatId !== chatId) return;

      if (typingTimeoutsRef.current[data.userId]) {
        clearTimeout(typingTimeoutsRef.current[data.userId]);
        delete typingTimeoutsRef.current[data.userId];
      }

      clearTypingUser(data.userId);
    },
    [chatId, currentUserId, clearTypingUser]
  );

  const handleLocalUserTyping = useCallback(() => {
    const now = Date.now();

    if (now - lastTypingEventRef.current > 2000 && chatId) {
      lastTypingEventRef.current = now;
      emitTyping({ chatId, userId: currentUserId });
    }

    if (typingDelayRef.current) {
      clearTimeout(typingDelayRef.current);
    }

    setIsTyping(true);

    typingDelayRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chatId) emitStopTyping({ chatId, userId: currentUserId });
    }, 3000);
  }, [chatId, currentUserId]);

  useEffect(() => {
    const clearTypingListener = onTyping(handleTypingEvent);
    const clearStopTypingListener = onStopTyping(handleStopTypingEvent);

    return () => {
      clearTypingListener();
      clearStopTypingListener();
    };
  }, [handleTypingEvent, handleStopTypingEvent]);
  useEffect(() => {
    const currentTimeouts = typingTimeoutsRef.current;
    const currentTypingDelay = typingDelayRef.current;

    return () => {
      Object.values(currentTimeouts).forEach(clearTimeout);

      if (currentTypingDelay) {
        clearTimeout(currentTypingDelay);
      }

      if (isTyping && chatId) {
        emitStopTyping({ chatId, userId: currentUserId });
      }
    };
  }, [isTyping, chatId, currentUserId]);

  return {
    typingUserIds,
    isTyping,
    handleLocalUserTyping,
  };
}
