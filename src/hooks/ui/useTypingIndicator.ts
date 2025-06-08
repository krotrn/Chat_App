import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector } from "@/hooks/types/useReduxType";
import {
  UseTypingIndicatorProps,
  UseTypingIndicatorReturn,
} from "@/types/ChatType";
import { TypingService } from "@/features/typing/services/typingService";

export function useTypingIndicator({
  chatId,
  currentUserId,
}: UseTypingIndicatorProps): UseTypingIndicatorReturn {
  const [isTyping, setIsTyping] = useState(false);
  const typingUserIds = useAppSelector((state) => state.typing.typingUserIds);

  const lastTypingEventRef = useRef<number>(0);
  const typingDelayRef = useRef<NodeJS.Timeout | null>(null);

  const currentChatTypingUserIds = chatId
    ? TypingService.filterTypingUsersByChatId(typingUserIds, chatId)
    : [];

  const handleLocalUserTyping = useCallback(() => {
    if (!chatId) return;

    const now = Date.now();

    if (now - lastTypingEventRef.current > 2000) {
      lastTypingEventRef.current = now;
      TypingService.emitTyping({ chatId, userId: currentUserId });
    }

    if (typingDelayRef.current) {
      clearTimeout(typingDelayRef.current);
    }

    setIsTyping(true);

    typingDelayRef.current = setTimeout(() => {
      setIsTyping(false);
      TypingService.emitStopTyping({ chatId, userId: currentUserId });
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
        TypingService.emitStopTyping({ chatId, userId: currentUserId });
      }
    };
  }, [chatId, currentUserId, isTyping]);

  return {
    typingUserIds: currentChatTypingUserIds,
    isTyping,
    handleLocalUserTyping,
  };
}
