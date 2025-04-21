"use client";

import React, {
  createContext,
  useState,
  useEffect,
  use,
  useCallback,
} from "react";
import useChatSocket from "@/hooks/useChatSocket";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import { ChatType, ConnectionState, MessageType } from "@/types/ChatType";
import {
  deleteOneOnOneChat,
  fetchChats,
  setAuthToken,
} from "@/services/chat-api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { User } from "next-auth";

interface ChatContextType {
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
  loadChats: () => Promise<void>;
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  connectionState: ConnectionState;
  typingUserIds: string[];
  handleLocalUserTyping: () => void;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUser: User;
  messages: MessageType[];
  isConnected: boolean;
  pinnedMessageIds: string[];
  handleDeleteChat: (chatId: string, forEveryone?: boolean) => Promise<void>;
  searchChatQuery: string;
  handleChatSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  token: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
  currentUser: User;
  token: string;
  initialMessages?: MessageType[];
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  currentUser,
  token,
  initialMessages = [],
}) => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchChatQuery, setSearchChatQuery] = useState("");

  const currentChatId = searchParams.get("chat");
  const setCurrentChatId = useCallback(
    (chatId: string | null) => {
      if (currentChatId !== chatId) {
        if (!chatId) {
          router.push("/chats");
        } else {
          router.push(`/chats?chat=${chatId}`);
        }
      }
    },
    [router, currentChatId],
  );
  if (!currentUser || !currentUser.id) {
    throw new Error("No current user found");
  }

  const {
    connectionState,
    setMessages,
    messages,
    isConnected,
    pinnedMessageIds,
  } = useChatSocket(
    currentChatId || "",
    currentUser.id,
    token,
    initialMessages,
  );

  const { typingUserIds, handleLocalUserTyping } = useTypingIndicator({
    chatId: currentChatId || "",
    currentUserId: currentUser.id,
  });

  const loadChats = useCallback(async () => {
    try {
      setAuthToken(token);
      const response = await fetchChats();
      setChats(response.chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  }, [token]);

  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone?: boolean) => {
      try {
        setAuthToken(token);
        await deleteOneOnOneChat({ chatId, forEveryone });
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChatId === chatId) {
          router.push("/chats");
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete chat");
      }
    },
    [currentChatId, router, token],
  );

  const handleChatSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSearchChatQuery(value);
      if (!value.trim()) {
        setChats(chats);
      } else {
        const filtered = chats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(value) ||
            chat.lastMessage?.content.includes(value),
        );
        setChats(filtered);
      }
    },
    [chats],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const chatContextValue = {
    chats,
    setChats,
    loadChats,
    currentChatId,
    setCurrentChatId,
    connectionState,
    typingUserIds,
    handleLocalUserTyping,
    setMessages,
    messages,
    currentUser,
    isConnected,
    pinnedMessageIds,
    handleDeleteChat,
    searchChatQuery,
    handleChatSearch,
    token,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
