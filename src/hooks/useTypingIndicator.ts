import { useState, useEffect, useRef, useCallback } from "react";
import { emitTyping, emitStopTyping } from "@/lib/socket";
import { useAppSelector } from "./useReduxType";

interface UseTypingIndicatorProps {
  chatId: string | null;
  currentUserId: string;
}

export default function useTypingIndicator({
  chatId,
  currentUserId,
}: UseTypingIndicatorProps) {
  const [isTyping, setIsTyping] = useState(false);

  const typingUserIds = useAppSelector((state) => state.chat.typingUserIds);

  const lastTypingEventRef = useRef<number>(0);
  const typingDelayRef = useRef<NodeJS.Timeout | null>(null);
  const currentChatTypingUserIds = chatId
    ? typingUserIds
        .filter((typing) => typing.chatId === chatId)
        .map((typing) => typing.userId)
    : [];

  const handleLocalUserTyping = useCallback(() => {
    if (!chatId) return;

    const now = Date.now();

    if (now - lastTypingEventRef.current > 2000) {
      lastTypingEventRef.current = now;
      emitTyping({ chatId, userId: currentUserId });
    }

    if (typingDelayRef.current) {
      clearTimeout(typingDelayRef.current);
    }

    setIsTyping(true);

    typingDelayRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping({ chatId, userId: currentUserId });
    }, 3000);
  }, [chatId, currentUserId]);
  useEffect(() => {
    return () => {
      const currentTypingDelay = typingDelayRef.current;
      const currentIsTyping = isTyping;

      if (currentTypingDelay) {
        clearTimeout(currentTypingDelay);
      }

      if (currentIsTyping && chatId) {
        emitStopTyping({ chatId, userId: currentUserId });
      }
    };
  }, [chatId, currentUserId, isTyping]);

  return {
    typingUserIds: currentChatTypingUserIds,
    isTyping,
    handleLocalUserTyping,
  };
}
