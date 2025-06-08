export interface TypingState {
  typingUserIds: TypingUser[];
}

export interface TypingUser {
  userId: string;
  chatId: string;
}

export interface TypingEvent {
  userId: string;
  chatId: string;
}

export interface TypingIndicatorProps {
  isTyping: boolean;
  typingUserIds: string[];
  participants: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
  }>;
}

export interface UseTypingIndicatorProps {
  chatId: string | null;
  currentUserId: string;
}

export interface UseTypingIndicatorReturn {
  typingUserIds: string[];
  isTyping: boolean;
  handleLocalUserTyping: () => void;
}
