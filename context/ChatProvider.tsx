"use client";

import {
  createContext,
  useState,
  useEffect,
  use,
  useCallback,
  useMemo,
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
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  connectionState: ConnectionState;
  typingUserIds: string[];
  handleLocalUserTyping: () => void;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUser: User;
  messages: MessageType[];
  pinnedMessageIds: string[];
  handleDeleteChat: (chatId: string, forEveryone?: boolean) => Promise<void>;
  searchChatQuery: string;
  handleChatSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  token: string;
  loadChats: () => Promise<void>;
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
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  currentUser,
  token,
}) => {
  /**
   * for getting search query.
   */
  const searchParams = useSearchParams();
  /**
   * For redirecting to the specific chat.
   */
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
    [currentChatId, router],
  );

  if (!currentUser.id) {
    throw new Error("No current user found");
  }

  /**
   * For storing the Typing user Ids
   */
  const { typingUserIds, handleLocalUserTyping } = useTypingIndicator({
    chatId: currentChatId || "",
    currentUserId: currentUser.id,
  });

  /**
   * For storing the the messages from selected chat in initial rendering.
   */
  const {
    connectionState,
    setMessages,
    messages,
    pinnedMessageIds,
    chats,
    setChats,
  } = useChatSocket(currentChatId || "", currentUser.id, token);

  /**
   * Load chat from server.
   */
  const loadChats = useCallback(async () => {
    try {
      setAuthToken(token);
      const response = await fetchChats();
      setChats(response.chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  }, [token, setChats]);
  useEffect(() => {
    if (currentChatId) {
      const currentChat = chats.find((chat) => chat._id === currentChatId);
      if (currentChat?.messages) {
        const filteredMessages = currentChat.messages.filter(
          (message) =>
            !message.deletedFor.some((ele) => ele.userId === currentUser.id),
        );
        setMessages(filteredMessages);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId, chats, currentUser.id, setMessages]);

  /**
   * For deleting the chat.
   */
  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone?: boolean) => {
      try {
        setAuthToken(token);
        await deleteOneOnOneChat({ chatId, forEveryone });
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChatId === chatId) {
          router.push("/chats");
          setMessages([]);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete chat");
      }
    },
    [currentChatId, router, token, setMessages, setChats],
  );

  /**
   * For searching the chat.
   */
  const handleChatSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSearchChatQuery(value);
      if (!value.trim()) {
        loadChats();
      } else {
        setChats((prevChats) =>
          prevChats.filter(
            (chat) =>
              chat.name.toLowerCase().includes(value) ||
              (chat.lastMessage?.content &&
                chat.lastMessage.content.toLowerCase().includes(value)),
          ),
        );
      }
    },
    [loadChats, setChats],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const chatContextValue = useMemo(() => {
    return {
      chats,
      setChats,
      currentChatId,
      setCurrentChatId,
      connectionState,
      typingUserIds,
      handleLocalUserTyping,
      setMessages,
      messages,
      currentUser,
      pinnedMessageIds,
      handleDeleteChat,
      searchChatQuery,
      handleChatSearch,
      token,
      loadChats,
    };
  }, [
    chats,
    setChats,
    currentChatId,
    setCurrentChatId,
    connectionState,
    typingUserIds,
    handleLocalUserTyping,
    setMessages,
    messages,
    currentUser,
    pinnedMessageIds,
    handleDeleteChat,
    searchChatQuery,
    handleChatSearch,
    token,
    loadChats,
  ]);

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
